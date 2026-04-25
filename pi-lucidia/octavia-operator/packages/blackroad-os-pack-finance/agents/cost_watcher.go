package agents

import (
	"context"
	"errors"
	"fmt"
	"io"
)

type SpendEvent struct {
	Service string
	Cost    float64
}

type CloudWatchStream interface {
	Next(ctx context.Context) (SpendEvent, error)
}

type SlackClient interface {
	PostMessage(channel string, message string) error
}

type CostWatcher struct {
	Channel   string
	Threshold float64
}

// StreamAlerts ingests spend events and posts alerts to Slack.
func (cw CostWatcher) StreamAlerts(ctx context.Context, stream CloudWatchStream, slack SlackClient) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		event, err := stream.Next(ctx)
		if errors.Is(err, io.EOF) {
			return nil
		}
		if err != nil {
			return err
		}
		if event.Cost >= cw.Threshold {
			msg := fmt.Sprintf("[finance-cost-watcher] %s spend at $%.2f", event.Service, event.Cost)
			if postErr := slack.PostMessage(cw.Channel, msg); postErr != nil {
				return postErr
			}
		}
	}
}
