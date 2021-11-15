import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Task } from "@pulumi/aws/datasync";

const tags = {'iac': 'pulumi', 'project': 'aoc-cloud9'}
const owner = new aws.iam.User('aoc-owner', {tags});
[
    'arn:aws:iam::aws:policy/AWSCloud9Administrator',
    'arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess',
].map(arn => new aws.iam.UserPolicyAttachment(`aoc-owner-policy-${arn.substring(arn.lastIndexOf('/') + 1)}`, {
    user: owner.name,
    policyArn: arn,
}));

const group = new aws.iam.Group('aoc-members');
new aws.iam.GroupPolicyAttachment('aoc-members-policy', {
    group: group.name,
    policyArn: 'arn:aws:iam::aws:policy/AWSCloud9EnvironmentMember'
});

const members = [
    'user1',
].map(name => new aws.iam.User(`aoc-member-${name}`, {tags}))
new aws.iam.GroupMembership('aoc-members-membership', {
    group: group.name,
    users: members.map(user => user.name)
});

const vpc = new aws.ec2.Vpc('aoc-vpc', {
    cidrBlock: '10.0.0.0/28',
    tags,
});

const internetGateway = new aws.ec2.InternetGateway('aoc-gateway', {
    vpcId: vpc.id,
    tags,
});

const publicRouteTable = new aws.ec2.DefaultRouteTable('aoc-public-rt', {
    defaultRouteTableId: vpc.defaultRouteTableId,
    tags,
});

new aws.ec2.Route('aoc-route-public-sn-to-ig', {
    routeTableId: publicRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: internetGateway.id,
});

const subnet = new aws.ec2.Subnet('aoc-subnet', {
    cidrBlock: vpc.cidrBlock,
    vpcId: vpc.id,
    mapPublicIpOnLaunch: true,
    tags,
});

new aws.ec2.RouteTableAssociation('aoc-public-rta', {
    subnetId: subnet.id,
    routeTableId: publicRouteTable.id,
});
