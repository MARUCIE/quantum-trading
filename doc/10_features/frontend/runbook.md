# Frontend Runbook - quantum_x

## Development

### Setup
```bash
cd frontend
pnpm install
pnpm dev
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Build
```bash
pnpm build
pnpm start
```

## Deployment

### Production Build
```bash
pnpm build
# Output: .next/
```

### Docker
```bash
docker build -t quantum-x-frontend .
docker run -p 3000:3000 quantum-x-frontend
```

## Monitoring

### Health Check
- URL: `/api/health`
- Expected: `{ "status": "ok" }`

### Performance Monitoring
- Use Chrome DevTools Performance tab
- Run Lighthouse audits regularly
- Monitor Core Web Vitals in production

## Troubleshooting

### WebSocket Connection Failed
1. Check WS_URL environment variable
2. Verify backend WebSocket server is running
3. Check browser console for errors
4. Verify network connectivity

### Chart Not Rendering
1. Check if data is loading (Network tab)
2. Verify chart container has dimensions
3. Check console for Lightweight Charts errors
4. Ensure proper cleanup on unmount

### Performance Issues
1. Run Lighthouse audit
2. Check for memory leaks (DevTools Memory)
3. Profile React renders (React DevTools)
4. Analyze bundle size
