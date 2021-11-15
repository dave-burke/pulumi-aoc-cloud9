import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const owner = new aws.iam.User('aoc-owner');
new aws.iam.UserPolicyAttachment('aoc-owner-policy', {
    user: owner.name,
    policyArn: 'arn:aws:iam::aws:policy/AWSCloud9Administrator',
});

const group = new aws.iam.Group('aoc-members');
new aws.iam.GroupPolicyAttachment('aoc-members-policy', {
    group: group.name,
    policyArn: 'arn:aws:iam::aws:policy/AWSCloud9EnvironmentMember'
});

const members = [
    'user1',
].map(name => new aws.iam.User(`aoc-member-${name}`))
new aws.iam.GroupMembership('aoc-members-membership', {
    group: group.name,
    users: members.map(user => user.name)
});
