import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const owner = new aws.iam.User('aoc-owner');

