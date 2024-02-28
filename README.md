# milehighcoder.com - My Game Development Portfolio and Blog

This is a repository for my webpage built on a static-site generator [Eleventy](https://www.11ty.dev/) to create a landing page for all my projects and thoughts. This project has been strung together with the help of all sorts of awesome 11ty developers worldwide!

## Deployment

All build processes rely on how `NODE_ENV` is set. For production builds, which means minified CSS and JS, you must set the value to `production.` I mention this explicitly as this is for some vendors, not the default.

If you want to speed up your build times, you can add the generated images to your git repo. The `.gitignore` already contains a comment section for that.

## Local Development

### Before you install dependencies

This repo uses [Volta](https://volta.sh/). You can get it, and it'll make your node life so much easier.

### Instructions

Clone this repository.

```zsh
git clone https://github.com/mblackman/milehighcoder-dot-com
```

Change into the cloned directory.

```zsh
cd milehighcoder-dot-com
```

Install dependencies. Note, if you prefer `npm` over `yarn` make sure to first remove the `yarn.lock` file, and then run `npm install`.

```zsh
yarn install
```

Run the local server.

```zsh
yarn dev
```

Open the page, usually on <http://localhost:8080>, and dig around!

## Get Started

1. Experience the Live Site: Visit [www.milehighcoder.com](https://milehighcoder.com/) for the full experience.
2. Contribute: Feel free to suggest improvements or open issues on this GitHub repository.


## Credits

Based on the awesome template [eleventy-chirpy-blog-template](https://github.com/muenzpraeger/eleventy-chirpy-blog-template) by [muenzpraeger](https://github.com/muenzpraeger).

The UX of this template is based on the popular Chirpy template, just with a different tech stack. If you prefer to run Jekyll and Bootstrap, check out [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) here. It's great.

Also, big thanks to the authors of the [11ty High-Performance Blog](https://github.com/google/eleventy-high-performance-blog).
