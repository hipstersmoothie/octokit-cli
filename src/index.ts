import Octokit from '@octokit/rest';
import routes from '@octokit/routes';
import changeCase from 'change-case';
import { app, Command, Option, MultiCommand } from 'command-line-application';
import dotenv from 'dotenv';
import envCi from 'env-ci';

import formatters from './formatters';

const { isCi, ...env } = envCi();
const slug = 'slug' in env ? env.slug : '';
const prNumber = 'pr' in env ? env.pr : '';
const [owner, repo] = slug.split('/');

type ApiName = keyof typeof routes;

interface MethodParam {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface Method {
  idName: string;
  description: string;
  params: MethodParam[];
}

/** Convert the string based type to a javascript Type */
function createType(type: string) {
  if (type === 'string') {
    return String;
  }

  if (type === 'boolean') {
    return Boolean;
  }

  if (type === 'integer') {
    return Number;
  }

  return undefined;
}

const optionParamsInCI = ['owner', 'repo', 'issue_number'];

/** Create a command-line-application Option from the param */
function createOption(param: MethodParam): Option {
  return {
    name: param.name,
    type: createType(param.type),
    description: optionParamsInCI.includes(param.name)
      ? `${param.description}Not required in CI`
      : param.description,
  };
}

/** Create a command-line-application Command from the method */
function createCommand(method: Method, truncateDescriptions: boolean): Command {
  const requiredParams = method.params
    .filter(({ name, required }) =>
      isCi && optionParamsInCI.includes(name) ? false : required
    )
    .map(({ name }) => name);

  return {
    name: method.idName,
    options: method.params.map(createOption),
    require: requiredParams,
    description: truncateDescriptions
      ? method.description.slice(0, method.description.indexOf('.'))
      : method.description,
  };
}

/** Create a command-line-application MultiCommand from the API */
function createMultiCommand(
  name: string,
  methods: Method[],
  truncateDescriptions: boolean
): MultiCommand {
  return {
    name,
    description: `The GitHub API for ${name}`,
    commands: methods.map(route => createCommand(route, truncateDescriptions)),
  };
}

/** Return the identity of the value */
const Identity = <T>(i: T) => i;

/** Call the formatter for method if it exists */
async function formatResponse(api: ApiName, method: string, response: any) {
  type FormatterName = keyof typeof formatters;

  const formatterGroup =
    api in formatters ? formatters[api as FormatterName] : {};

  const formatter =
    method in formatterGroup
      ? formatterGroup[method as keyof typeof formatterGroup]
      : Identity;

  const formatted = await formatter(response);

  return formatted;
}

/** Create the CLi definition for the routes found in @octokit/routes */
function createCli(): MultiCommand {
  const commandIndex = process.argv.findIndex(arg =>
    Object.keys(routes).includes(arg)
  );
  const truncateDescriptions =
    process.argv[commandIndex + 1] === '--help' ||
    process.argv[commandIndex + 1] === '-h' ||
    process.argv[commandIndex + 1] === undefined;

  const commands = Object.entries(routes).map(([route, methods]) =>
    createMultiCommand(route, methods, truncateDescriptions)
  );

  return {
    name: 'octokit',
    description: 'A CLI for interacting with GitHub via octokit',
    commands,
  };
}

/** Create the CLI and run the users input through @octokit/rest */
export default async () => {
  dotenv.config();

  const cli = createCli();
  const args = app(cli, { camelCase: false });

  if (!args) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-underscore-dangle
  const [api, method] = args._command as [ApiName, any];
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN,
  });

  // @ts-ignore
  const response = await octokit[api][changeCase.camelCase(method)]({
    owner,
    repo,
    issue_number: prNumber,
    ...args,
  });

  // eslint-disable-next-line no-console
  console.log(await formatResponse(api, method, response));
};
