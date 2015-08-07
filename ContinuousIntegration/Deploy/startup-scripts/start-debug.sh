#!/bin/sh

export AWS_ACCESS_KEY_ID=AKIAJQV73YGP6VI43VHQ
export AWS_SECRET_ACCESS_KEY=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
export NODE_ENV=debug

PORT=51350 node ../../../bin/www > news.log &
