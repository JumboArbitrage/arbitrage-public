package main

import (
	"context"
	"io"
	"math/big"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFormatGasPriceWei(t *testing.T) {
	tests := []struct {
		name string
		wei  string
		want string
	}{
		{name: "gwei", wei: "1000000000", want: "0.000000001"},
		{name: "wei", wei: "1", want: "0.000000000000000001"},
		{name: "eth", wei: "1000000000000000000", want: "1"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			value, ok := new(big.Int).SetString(test.wei, 10)
			if !ok {
				t.Fatalf("invalid test wei value")
			}
			got, err := FormatGasPriceWei(value)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != test.want {
				t.Fatalf("expected %q, got %q", test.want, got)
			}
		})
	}
}

func TestBuildArbitrageFormDirections(t *testing.T) {
	buyIn, err := BuildArbitrageForm(ArbitrageParem{
		Gasprice: big.NewInt(1000000000),
		InOrOut:  BuyIn,
	})
	if err != nil {
		t.Fatalf("unexpected buy-in error: %v", err)
	}
	if got := buyIn.Encode(); got != "Gasprice=0.000000001&InOrOut=true" {
		t.Fatalf("unexpected buy-in form: %s", got)
	}

	buyOut, err := BuildArbitrageForm(ArbitrageParem{
		Gasprice: big.NewInt(2000000000),
		InOrOut:  BuyOut,
	})
	if err != nil {
		t.Fatalf("unexpected buy-out error: %v", err)
	}
	if got := buyOut.Encode(); got != "Gasprice=0.000000002&InOrOut=false" {
		t.Fatalf("unexpected buy-out form: %s", got)
	}
}

func TestPostArbitrageSendsFormRequest(t *testing.T) {
	var gotContentType string
	var gotBody string
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		gotContentType = request.Header.Get("Content-Type")
		body, err := io.ReadAll(request.Body)
		if err != nil {
			t.Fatalf("failed to read request body: %v", err)
		}
		gotBody = string(body)
		response.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := BackendClient{URL: server.URL, HTTPClient: server.Client()}
	err := client.PostArbitrage(context.Background(), ArbitrageParem{
		Gasprice: big.NewInt(1000000000),
		InOrOut:  BuyIn,
	})
	if err != nil {
		t.Fatalf("unexpected post error: %v", err)
	}
	if gotContentType != "application/x-www-form-urlencoded" {
		t.Fatalf("unexpected content type: %s", gotContentType)
	}
	if gotBody != "Gasprice=0.000000001&InOrOut=true" {
		t.Fatalf("unexpected body: %s", gotBody)
	}
}

func TestPostArbitrageReturnsBackendError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		response.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	client := BackendClient{URL: server.URL, HTTPClient: server.Client()}
	err := client.PostArbitrage(context.Background(), ArbitrageParem{
		Gasprice: big.NewInt(1000000000),
		InOrOut:  BuyOut,
	})
	if err == nil {
		t.Fatalf("expected backend error")
	}
}
