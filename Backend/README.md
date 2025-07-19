# Synergy AI - Flask Backend

This is the Flask backend for the Synergy AI workspace optimization platform. It provides RESTful APIs for space management, energy analytics, AI model integration, and real-time data processing.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   python start_server.py
   ```

   Or directly:
   ```bash
   python app.py
   ```

4. **Verify the server is running:**
   - Server URL: http://localhost:5000
   - Health check: http://localhost:5000/api/health

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Data Endpoints
- `GET /api/data/occupancy` - Get occupancy data
- `GET /api/data/spaces` - Get space data
- `GET /api/data/environmental` - Get environmental data
- `GET /api/data/weekly-trend` - Get weekly trends
- `GET /api/data/zone-heatmap` - Get zone heatmap

### Employee Management
- `GET /api/employees` - Get employees list
- `POST /api/employees/add` - Add new employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

### Space Management
- `GET /api/spaces/detailed` - Get detailed space information
- `POST /api/spaces/add` - Add new space

### Analytics
- `GET /api/analytics/predictions` - Get AI predictions
- `GET /api/analytics/optimization` - Get optimization suggestions

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/alerts` - Get alerts
- `GET /api/dashboard/predictions` - Get dashboard predictions
- `GET /api/dashboard/optimization` - Get optimization suggestions
- `GET /api/dashboard/user-activity` - Get user activity
- `GET /api/dashboard/recommendations` - Get space recommendations
- `GET /api/dashboard/metrics/summary` - Get metrics summary

### Energy Analytics
- `GET /api/energy/dashboard` - Get energy dashboard
- `GET /api/energy/predictions` - Get energy predictions
- `GET /api/energy/optimization` - Get energy optimization
- `GET /api/energy/analysis` - Get energy analysis

### Reports
- `GET /api/reports/export/{type}` - Export reports
- `GET /api/dashboard/export/{type}` - Export dashboard reports

### Health Check
- `GET /api/health` - Server health check

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV` - Flask environment (development/production)
- `FLASK_DEBUG` - Enable debug mode (1/0)

### CORS Configuration
The server is configured to accept requests from:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (React dev server)
- All origins (*) for development

## 📁 Project Structure

```
Backend/
├── app.py                 # Main Flask application
├── start_server.py        # Server startup script
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── energy_predictor.py   # Energy prediction model
├── Space Energy AI.py    # Space optimization model
└── Dashboard API.py      # Dashboard API functions
```

## 🧪 Testing

### Manual Testing
You can test the API endpoints using curl or any API client:

```bash
# Health check
curl http://localhost:5000/api/health

# Get occupancy data
curl http://localhost:5000/api/data/occupancy

# Get space data
curl http://localhost:5000/api/data/spaces
```

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@synergy.com",
    "password": "admin123",
    "user_type": "admin"
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   # Kill the process
   kill -9 <PID>
   ```

2. **Missing dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Import errors:**
   - Make sure you're in the Backend directory
   - Check that all files exist
   - Verify Python version (3.8+)

4. **CORS errors:**
   - Check that the frontend is running on the correct port
   - Verify CORS configuration in app.py

### Logs
The server logs are displayed in the console. Look for:
- ✅ Success messages
- ❌ Error messages
- 🔄 Request logs

## 🔄 Development

### Adding New Endpoints
1. Add the route decorator in `app.py`
2. Implement the function logic
3. Add proper error handling
4. Update this README with the new endpoint

### Data Models
The backend uses mock data generators for development. In production:
1. Replace mock functions with database queries
2. Add proper data validation
3. Implement authentication middleware
4. Add rate limiting

## 🚀 Production Deployment

For production deployment:

1. **Set environment variables:**
   ```bash
   export FLASK_ENV=production
   export FLASK_DEBUG=0
   ```

2. **Use a production WSGI server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Configure reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs
3. Test individual endpoints
4. Verify frontend-backend communication

## 🔗 Related Links

- Frontend Repository: [Synergy AI Frontend](../src/)
- API Documentation: http://localhost:5000/api/health
- Main README: [../README.md](../README.md)