module.exports = {
  db: {
    setstory: {
      host: 'stredmdb.cvmqdzp0bk4n.us-west-2.rds.amazonaws.com',
      port: '3306',
      database: 'setstory',
      user: 'root',
      password: 'lagomar2010',
      connectionLimit: 1000
    },
    main: {
      host: 'stredmdb.cvmqdzp0bk4n.us-west-2.rds.amazonaws.com',
      port: '3306',
      database: 'main',
      user: 'root',
      password: 'lagomar2010',
      connectionLimit: 1000
    }
  },
  aws: {
    "accessKeyId": "AKIAJORBG6UIE56YSS3A",
    "secretAccessKey": "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"
  },
  auth_tokens: {
    instagram: "447746666.4f80570.bad2f149adf040808bbf6a97ed393fdc"
  }
}