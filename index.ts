import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { Task } from "@pulumi/aws/datasync";

const tags = {'iac': 'pulumi', 'project': 'aoc-cloud9'}
const owner = new aws.iam.User('aoc-owner', {
    forceDestroy: true,
    tags,
});
new aws.iam.UserPolicyAttachment('aoc-owner-policy-attachment', {
    user: owner.name,
    policyArn: 'arn:aws:iam::aws:policy/AWSCloud9User',
});
export const ownerLoginProfile = new aws.iam.UserLoginProfile(`aoc-member-owner-login-profile`, {
    user: owner.name,
    pgpKey: "keybase:<username that exists>",
});

const group = new aws.iam.Group('aoc-members');
new aws.iam.GroupPolicyAttachment('aoc-members-policy-attachment', {
    group: group.name,
    policyArn: 'arn:aws:iam::aws:policy/AWSCloud9EnvironmentMember'
});

const members = [
    'user1',
    'user2',
].reduce((map, name) => {
    map.set(name, new aws.iam.User(`aoc-member-${name}`, {
        forceDestroy: true,
        tags,
    }));
    return map;
}, new Map());
new aws.iam.GroupMembership('aoc-members-membership', {
    group: group.name,
    users: Array.from(members, ([k,v]) => v.name),
});
export const memberLoginProfiles = Array.from(members, ([name,member]) => {
    return new aws.iam.UserLoginProfile(`aoc-member-${name}-login-profile`, {
        user: member.name,
        pgpKey: "keybase:<username that exists>",
    });
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

new aws.cloud9.EnvironmentEC2('aoc-environment', {
    instanceType: 't3.small',
    ownerArn: owner.arn,
    subnetId: subnet.id,
    tags,
});
