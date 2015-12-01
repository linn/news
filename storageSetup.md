# Product Cloud Storage

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
