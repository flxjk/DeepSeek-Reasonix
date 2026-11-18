package market

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

func TestVoteSendsTheTokenAndValueToTheRegistry(t *testing.T) {
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/v1/packages/acme/kit/vote" {
			t.Errorf("%s %s", r.Method, r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer tok" {
			t.Errorf("authorization = %q", got)
		}
		var body map[string]int
		_ = json.NewDecoder(r.Body).Decode(&body)
		if body["value"] != -1 || len(body) != 1 {
			t.Errorf("body = %v", body)
		}
		_, _ = w.Write([]byte(`{"value":-1,"upCount":3,"downCount":1,"approvalRate":0.75}`))
	})
	v, err := c.Vote(context.Background(), "tok", "acme/kit", -1)
	if err != nil {
		t.Fatal(err)
	}
	if v.Value != -1 || v.UpCount != 3 || v.DownCount != 1 || v.ApprovalRate == nil || *v.ApprovalRate != 0.75 {
		t.Fatalf("vote = %+v", v)
	}
}

func TestVoteRefusesBeforeAskingWhenItCannotSucceed(t *testing.T) {
	var calls atomic.Int32
	c := testClient(t, func(http.ResponseWriter, *http.Request) { calls.Add(1) })
	if _, err := c.Vote(context.Background(), "tok", "acme/kit", 2); !errors.Is(err, ErrBadVote) {
		t.Errorf("value 2: err = %v", err)
	}
	if _, err := c.Vote(context.Background(), "", "acme/kit", 1); !errors.Is(err, ErrSignedOut) {
		t.Errorf("no token: err = %v", err)
	}
	if _, err := c.MyVote(context.Background(), "tok", "../x"); !errors.Is(err, ErrBadSlug) {
		t.Errorf("bad slug: err = %v", err)
	}
	if calls.Load() != 0 {
		t.Fatalf("registry asked %d times", calls.Load())
	}
}

// The registry is the one that knows why it refused; its code decides the
// sentinel, never the status alone and never the message.
func TestRegistryRefusalsKeepTheirIdentity(t *testing.T) {
	cases := []struct {
		status int
		code   string
		want   error
	}{
		{401, "unauthorized", ErrSignedOut},
		{403, "email_unverified", ErrEmailUnverified},
		{403, "own_package", ErrOwnPackage},
		{404, "not_found", ErrNotFound},
		{429, "rate_limited", ErrRateLimited},
		{503, "accounts_unavailable", ErrUnreachable},
		{403, "forbidden", ErrBadResponse},
		{500, "internal", ErrBadResponse},
	}
	for _, tc := range cases {
		c := testClient(t, func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(tc.status)
			_, _ = w.Write([]byte(`{"error":{"code":"` + tc.code + `","message":"own_package email_unverified"}}`))
		})
		if _, err := c.Vote(context.Background(), "tok", "acme/kit", 1); !errors.Is(err, tc.want) {
			t.Errorf("%d %s: err = %v, want %v", tc.status, tc.code, err, tc.want)
		}
	}
}

// A redirect is where a bearer would leak to another host; it is refused as
// an answer and the token goes nowhere else.
func TestVoteTokenNeverFollowsARedirect(t *testing.T) {
	var leaked atomic.Int32
	other := httptest.NewTLSServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) { leaked.Add(1) }))
	t.Cleanup(other.Close)
	c := testClient(t, func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, other.URL+"/steal", http.StatusTemporaryRedirect)
	})
	if _, err := c.Vote(context.Background(), "tok", "acme/kit", 1); !errors.Is(err, ErrBadResponse) {
		t.Fatalf("err = %v, want ErrBadResponse", err)
	}
	if leaked.Load() != 0 {
		t.Fatal("the redirect target was contacted")
	}
}
