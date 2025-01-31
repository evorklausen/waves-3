module.exports = {
  apps: [
    {
      name: 'wavesaibeta',  // Name of your application (you can change this)
      script: './server.js', // Path to your server file
      watch: true,           // Optional: Watch for file changes
      max_restarts: 10,      // Optional: Limit the number of restarts
      restart_delay: 1000,   // Optional: Delay between restarts (ms)
      error_file: './logs/error.log', // Log file for errors (ensure the logs directory exists)
      out_file: './logs/output.log',  // Log file for standard output
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // Format for log timestamps
    }
  ]
};

