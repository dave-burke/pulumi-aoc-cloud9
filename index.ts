import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const owner = new aws.iam.User('aoc-owner');
new aws.iam.UserPolicyAttachment('aoc-owner-policy', {
    user: owner.name,
    policyArn: 'arn:aws:iam::aws:policy/AWSCloud9Administrator',
});

