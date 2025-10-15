# WebSocket Channel Subscription Guide

## Overview

The upgraded WebSocket server now supports channel-based subscriptions in addition to game-specific subscriptions. This provides a more flexible and efficient way to receive updates for broad categories of data.

## Channel vs Game Subscriptions

### Game Subscriptions (Original)
```javascript
// Subscribe to specific game updates
ws.send(JSON.stringify({
  type: 'subscribe',
  gameId: 'game-12345'
}));
```
**Use when**: You want updates for a specific game only.

### Channel Subscriptions (New)
```javascript
// Subscribe to all NCAA baseball updates
ws.send(JSON.stringify({
  type: 'subscribeChannel',
  channel: 'ncaa-baseball'
}));
```
**Use when**: You want updates for a category or topic (e.g., all NCAA baseball games).

## Available Channels

### NCAA Baseball
**Channel**: `ncaa-baseball`

Provides live updates for all NCAA baseball games including:
- Live game scores
- Play-by-play events
- Game status changes
- Statistical updates

```javascript
// Subscribe
ws.send(JSON.stringify({
  type: 'subscribeChannel',
  channel: 'ncaa-baseball'
}));

// Unsubscribe
ws.send(JSON.stringify({
  type: 'unsubscribeChannel',
  channel: 'ncaa-baseball'
}));
```

### Expected Updates
```javascript
{
  type: 'ncaaBaseballUpdate',
  channel: 'ncaa-baseball',
  timestamp: '2025-10-15T21:30:00.000Z',
  gameId: 'game-12345',
  score: { home: 5, away: 3 },
  inning: 7,
  // ... additional game data
}
```

## Client Implementation Examples

### JavaScript/Node.js
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Subscribe to NCAA baseball channel
  ws.send(JSON.stringify({
    type: 'subscribeChannel',
    channel: 'ncaa-baseball'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  switch(message.type) {
    case 'channelSubscribed':
      console.log(`Subscribed to: ${message.channel}`);
      break;
      
    case 'ncaaBaseballUpdate':
      console.log('NCAA Baseball Update:', message);
      // Handle the update
      break;
      
    case 'error':
      console.error('Error:', message.message);
      break;
  }
});
```

### Python
```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    
    if data['type'] == 'channelSubscribed':
        print(f"Subscribed to: {data['channel']}")
    elif data['type'] == 'ncaaBaseballUpdate':
        print(f"NCAA Baseball Update: {data}")

def on_open(ws):
    # Subscribe to NCAA baseball channel
    ws.send(json.dumps({
        'type': 'subscribeChannel',
        'channel': 'ncaa-baseball'
    }))

ws = websocket.WebSocketApp(
    'ws://localhost:3001',
    on_open=on_open,
    on_message=on_message
)

ws.run_forever()
```

### Browser (Vanilla JavaScript)
```html
<!DOCTYPE html>
<html>
<head>
  <title>NCAA Baseball Updates</title>
</head>
<body>
  <h1>NCAA Baseball Live Updates</h1>
  <div id="updates"></div>

  <script>
    const ws = new WebSocket('ws://localhost:3001');
    const updatesDiv = document.getElementById('updates');

    ws.onopen = () => {
      console.log('Connected');
      
      // Subscribe to NCAA baseball
      ws.send(JSON.stringify({
        type: 'subscribeChannel',
        channel: 'ncaa-baseball'
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ncaaBaseballUpdate') {
        const update = document.createElement('div');
        update.textContent = `Game ${data.gameId}: ${JSON.stringify(data.score)}`;
        updatesDiv.prepend(update);
      }
    };
  </script>
</body>
</html>
```

## Message Types

### Subscribe to Channel
```javascript
{
  type: 'subscribeChannel',
  channel: 'ncaa-baseball'  // or use 'name' field
}
```

### Unsubscribe from Channel
```javascript
{
  type: 'unsubscribeChannel',
  channel: 'ncaa-baseball'
}
```

### Subscription Confirmation
```javascript
{
  type: 'channelSubscribed',
  channel: 'ncaa-baseball',
  message: 'Subscribed to channel ncaa-baseball'
}
```

### Unsubscription Confirmation
```javascript
{
  type: 'channelUnsubscribed',
  channel: 'ncaa-baseball',
  message: 'Unsubscribed from channel ncaa-baseball'
}
```

### Error Response
```javascript
{
  type: 'error',
  message: 'channel is required to subscribe to a feed'
}
```

## Best Practices

### 1. Subscribe on Connection
```javascript
ws.on('open', () => {
  // Subscribe immediately after connecting
  ws.send(JSON.stringify({
    type: 'subscribeChannel',
    channel: 'ncaa-baseball'
  }));
});
```

### 2. Handle Reconnection
```javascript
function connect() {
  const ws = new WebSocket('ws://localhost:3001');
  
  ws.on('close', () => {
    console.log('Disconnected, reconnecting in 5s...');
    setTimeout(connect, 5000);
  });
  
  ws.on('open', () => {
    // Re-subscribe after reconnection
    ws.send(JSON.stringify({
      type: 'subscribeChannel',
      channel: 'ncaa-baseball'
    }));
  });
}

connect();
```

### 3. Unsubscribe on Cleanup
```javascript
// React example
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribeChannel',
      channel: 'ncaa-baseball'
    }));
  };
  
  // Cleanup function
  return () => {
    ws.send(JSON.stringify({
      type: 'unsubscribeChannel',
      channel: 'ncaa-baseball'
    }));
    ws.close();
  };
}, []);
```

### 4. Multiple Channels
```javascript
// You can subscribe to multiple channels
const channels = ['ncaa-baseball', 'sec-football', 'conference-news'];

ws.on('open', () => {
  channels.forEach(channel => {
    ws.send(JSON.stringify({
      type: 'subscribeChannel',
      channel
    }));
  });
});
```

## Testing

### Using wscat
```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c ws://localhost:3001

# Subscribe to channel
> {"type": "subscribeChannel", "channel": "ncaa-baseball"}

# Wait for confirmation
< {"type":"channelSubscribed","channel":"ncaa-baseball","message":"Subscribed to channel ncaa-baseball"}

# Unsubscribe
> {"type": "unsubscribeChannel", "channel": "ncaa-baseball"}
```

### Using curl (HTTP upgrade)
```bash
# Test WebSocket connection
curl --include \
     --no-buffer \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     http://localhost:3001/
```

## Troubleshooting

### Issue: Not receiving updates
**Solution**: Verify you're subscribed correctly
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data.type);  // Check message types
};
```

### Issue: "channel is required" error
**Solution**: Ensure channel field is provided
```javascript
// ✅ Correct
{ type: 'subscribeChannel', channel: 'ncaa-baseball' }

// ❌ Wrong
{ type: 'subscribeChannel' }
```

### Issue: Connection closes immediately
**Solution**: Check server is running
```bash
# Start the WebSocket server
cd /home/runner/work/Blaze-College-Baseball/Blaze-College-Baseball
node api/websocket-server.js
```

## Performance Considerations

### Channel Subscriptions vs Game Subscriptions

**Channel subscriptions are more efficient when**:
- You need updates from multiple games in a category
- You're building a dashboard view
- You want to reduce subscription management overhead

**Game subscriptions are better when**:
- You only care about one specific game
- You want to minimize bandwidth for specific use cases
- You need very targeted updates

### Bandwidth Usage
- Channel subscriptions receive all updates for that category
- Consider filtering client-side if needed
- Unsubscribe from channels when not needed

## Migration Guide

### From Game-Only to Hybrid
```javascript
// Before (game-only)
games.forEach(game => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    gameId: game.id
  }));
});

// After (hybrid approach)
// Subscribe to channel for all games
ws.send(JSON.stringify({
  type: 'subscribeChannel',
  channel: 'ncaa-baseball'
}));

// Still subscribe to specific games if needed for detailed updates
focusedGame && ws.send(JSON.stringify({
  type: 'subscribe',
  gameId: focusedGame.id
}));
```

## Backward Compatibility

✅ All existing game-based subscriptions continue to work unchanged.

The channel subscription system is **additive** - you can use:
- Only game subscriptions (original behavior)
- Only channel subscriptions (new feature)
- Both together (hybrid approach)

## Support

For issues or questions:
- See `BSI-UPGRADE-SUMMARY.md` for upgrade details
- Check server logs for connection issues
- Review `api/websocket-server.js` for implementation details

## Related Documentation

- `BSI-UPGRADE-SUMMARY.md` - Upgrade details and technical changes
- `api/websocket-server.js` - Implementation
- BSI Repository: https://github.com/ahump20/BSI.git
