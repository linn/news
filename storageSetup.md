# Development Permissions

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1439206576000",
            "Effect": "Allow",
            "Action": [
                "dynamodb:*"
            ],
            "Resource": [
                "arn:aws:dynamodb:eu-west-1:545349016803:table/linn.cloud.news.int"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::linn.cloud.news.attachments.int"
            ]
        },
        {
            "Sid": "Stmt1439206617000",
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::linn.cloud.news.attachments.int/*"
            ]
        }
    ]
}
```

# Production Attachment Storage

1. Create S3 Bucket: linn.cloud.news.attachments

Add Bucket Policy:
```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "AllowPublicRead",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::linn.cloud.news.attachments/*"
		}
	]
}
```

2. Create S3 Bucket: linn.cloud.news

* Primary Key Type: Hash
* string HashKey: articleId
* No indices
* No provisioned throughput capacity*
* No throughput alarms* (Only because we don't yet know if we should use them)
