// Menu: Kit Discusssions
// Description: View Kit Discussions
// Author: Zach Zeleznick
// Twitter: @zzxiv

const {focusTab} = await kit('chrome')
const humanizeDuration = await npm('humanize-duration')

const emojisDB = db("emojis", { emojis: {} });
const emojisRef = emojisDB.get("emojis");
const categoriesDB = db("kit-discussions", { categories: [] });
const categoriesRef = categoriesDB.get("categories");

const githubURL = "https://api.github.com/graphql";

let token = env.GITHUB_ACCESS_TOKEN;

if (!token) {
  const element = `
  <div class="flex flex-col justify-center">
    <div>
      <a href="https://github.com/settings/tokens/new">Create a token</a> with "public_repo" enabled.
    </div>
    <br>
    <div>
      Then, copy + paste the token above or set <code>GITHUB_REPO_TOKEN</code> inside <code>~/.kenv/.env</code>
    </div>
  </div>`

  token = await env("GITHUB_ACCESS_TOKEN", {
    info: `Create and enter your personal access token`,
    choices: element,
  });
}

const fetchEmojis = async () => {
  // Could install and use as an npm package, but we just need a k-v map ...
  const emojiURL = 'https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json';
  const response = await get(emojiURL);
  const emojis = response.data;
  // console.log(JSON.stringify(emojis, null, 2));
  emojisDB.set("emojis", emojis).write();
}

const setupEmojis = async () => {
  const emojis = emojisRef.value();
  if (!emojis || !Object.keys(emojis).length) {
    await fetchEmojis()
  }
  return emojis
}

const lookupEmoji = (key) => {
  const emojis = emojisRef.value();
  return emojis[key.slice(1, key.length - 1)]
}

const config = {
  headers: {
    "Authorization": `Bearer ${token}`,
    "GraphQL-Features": "discussions_api",
  }
}

const categoriesQuery = `
query {
  repository(owner: "johnlindquist", name: "kit") {
    discussionCategories(first: 10) {
      # type: DiscussionConnection
      totalCount # Int!
      nodes {
        id,
        name,
        emoji,
        # emojiHTML,
        description,
      }
    }
  }
}`

const fetchCategories = async () => {
  let response;
  try {
    response = await post(githubURL,
      {
        query: categoriesQuery
      },
      config
    );
  }
  catch (err) {
    console.warn("fetchCategories failed:", err);
    return
  }
  const graphqlResponse = response.data;
  // console.log(JSON.stringify(categories, null, 2));
  const {
    data: {
      repository: {
        discussionCategories: {
          totalCount,
          nodes
        }
      }
    }
  } = graphqlResponse;
  categoriesDB.set("categories", nodes).write();
}

const setupCategories = async () => {
  const categories = categoriesRef.value();
  if (!categories || !categories.length) {
    await fetchCategories()
  }
  return categories
}

// NOTE: can use `categoryId` in discussions query
// to limit results or could just fetch all and filter

const discussionInnerQuery = `
# type: DiscussionConnection
  totalCount # Int!
  nodes {
    # type: Discussion
    id,
    title,
    # bodyText,
    createdAt,
    resourcePath,
    category {
      id,
      name,
      emoji,
    },
    author {
      login,
      # avatarUrl,
    }
  }
`

const allDiscussionsQuery = `
query {
  repository(owner: "johnlindquist", name: "kit") {
    discussions(first: 10, orderBy: {
      field: CREATED_AT,
      direction: DESC,
    }) {
      ${discussionInnerQuery}
    }
  }
}`

const buildCategoryQuery = (categoryId) => `
query {
  repository(owner: "johnlindquist", name: "kit") {
    discussions(first: 10, categoryId: "${categoryId}", orderBy: {
      field: CREATED_AT,
      direction: DESC,
    }) {
      ${discussionInnerQuery}
    }
  }
}`

const fetchDiscussions = async (categoryId = "") => {
  let response;
  const query = categoryId ? buildCategoryQuery(categoryId) : allDiscussionsQuery;
  try {
    response = await post(githubURL,
      {
        query,
      },
      config
    );
  }
  catch (err) {
    console.warn("fetchDiscussions failed:", err);
    return
  }
  const {data, errors } = response.data;
  if (errors) {
    console.warn("fetchDiscussions errors:", errors);
    // todo: handle errors
  }
  const {
    repository: {
      discussions: {
        totalCount,
        nodes
      }
    }
  } = data;
  // console.log(JSON.stringify(nodes, null, 2));
  return nodes;
}

const allDiscussions = async () => await fetchDiscussions();

const buildHtml = ({emoji}) => {
  const glyph = lookupEmoji(emoji)
  return `<div class="flex justify-center">
    <div> ${glyph} </div>
  </div>
  `
}

const humanizeTime = (createdAt) => {
  const then = new Date(createdAt);
  const now = new Date();
  const duration = now.getTime() - then.getTime();
  if (duration < 259200000) { // within 30 days (in ms)
    return `${humanizeDuration(duration, { round: true, largest: 1 })} ago`;
  }
  const sameYear = now.getYear() === then.getYear();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = { timeZone, year: sameYear ? undefined : 'numeric', month: 'short', day: 'numeric' };
  return `on ${then.toLocaleDateString('en-US', options)}`
}

const buildChoice = (node) => {
  const {
    title,
    resourcePath,
    createdAt,
    category: {
      name,
      emoji,
    },
    author: {
      login
    },
  } = node;
  const url = `https://github.com${resourcePath}`
  const description = `${login} created ${humanizeTime(createdAt)} in ${name}`
  const html = buildHtml({emoji})
  return {
      name: title,
      value: url,
      description,
      html,
  }
}

const showCategory = async (categoryId) => {
  const nodes = await fetchDiscussions(categoryId);
  const choices = nodes.map(buildChoice);
  const selectedIssue = await arg("Search discussions:", choices);
  focusTab(selectedIssue);
}

const buildTabs = async () => {
  const categories = await setupCategories();
  let tabs = [ {
    name: "All",
    method: showCategory
  }];
  categories.map(({name, id}) => {
    tabs.push( { name, method: async () => await showCategory(id) } )
  });
  tabs.map(({name, method}) => {
   onTab(name, method);
  });
}

await setupEmojis();

buildTabs();
