package tests

import (
	"context"
	"errors"
	"io"
	"sync"
	"testing"
	"time"

	"financepack/agents"
)

type fakeStream struct {
	events []agents.SpendEvent
	idx    int
}

func (f *fakeStream) Next(ctx context.Context) (agents.SpendEvent, error) {
	if f.idx >= len(f.events) {
		return agents.SpendEvent{}, io.EOF
	}
	e := f.events[f.idx]
	f.idx++
	return e, nil
}

type fakeSlack struct {
	mu     sync.Mutex
	posted []string
}

func (f *fakeSlack) PostMessage(channel string, message string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.posted = append(f.posted, channel+":"+message)
	return nil
}

func TestStreamAlertsPostsAboveThreshold(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	stream := &fakeStream{events: []agents.SpendEvent{{Service: "EC2", Cost: 150.0}}}
	slack := &fakeSlack{}
	watcher := agents.CostWatcher{Channel: "#alerts", Threshold: 100}

	if err := watcher.StreamAlerts(ctx, stream, slack); err != nil && !errors.Is(err, io.EOF) {
		t.Fatalf("streaming failed: %v", err)
	}

	if len(slack.posted) != 1 {
		t.Fatalf("expected 1 alert, got %d", len(slack.posted))
	}
}
