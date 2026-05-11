package main

import (
	"context"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"net/url"
	"strings"
)

type BackendClient struct {
	URL        string
	HTTPClient *http.Client
}

func NewBackendClient(config RuntimeConfig) BackendClient {
	return BackendClient{
		URL:        config.BackendURL,
		HTTPClient: http.DefaultClient,
	}
}

func FormatGasPriceWei(gasPrice *big.Int) (string, error) {
	if gasPrice == nil {
		return "", fmt.Errorf("gas price is required")
	}
	if gasPrice.Sign() < 0 {
		return "", fmt.Errorf("gas price must not be negative")
	}
	denominator := big.NewInt(1000000000000000000)
	value := new(big.Rat).SetFrac(new(big.Int).Set(gasPrice), denominator)
	text := value.FloatString(18)
	text = strings.TrimRight(text, "0")
	text = strings.TrimSuffix(text, ".")
	if text == "" {
		return "0", nil
	}
	return text, nil
}

func backendInOrOut(direction int) (string, error) {
	if direction == BuyIn {
		return "true", nil
	}
	if direction == BuyOut {
		return "false", nil
	}
	return "", fmt.Errorf("unsupported arbitrage direction: %d", direction)
}

func BuildArbitrageForm(param ArbitrageParem) (url.Values, error) {
	gasPrice, err := FormatGasPriceWei(param.Gasprice)
	if err != nil {
		return nil, err
	}
	inOrOut, err := backendInOrOut(param.InOrOut)
	if err != nil {
		return nil, err
	}
	form := url.Values{}
	form.Add("Gasprice", gasPrice)
	form.Add("InOrOut", inOrOut)
	return form, nil
}

func (client BackendClient) PostArbitrage(ctx context.Context, param ArbitrageParem) error {
	if client.URL == "" {
		return fmt.Errorf("backend URL is required")
	}
	form, err := BuildArbitrageForm(param)
	if err != nil {
		return err
	}
	httpClient := client.HTTPClient
	if httpClient == nil {
		httpClient = http.DefaultClient
	}
	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		client.URL,
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := httpClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, response.Body)
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("backend returned %s", response.Status)
	}
	return nil
}
