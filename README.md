# MetadataMenu. LLM Assistant
Automatically fills in tags and properties (frontmatter) of notes in Obsidian using an LLM based on templates.

Requires the user's API key to function. There are preconfigured providers and their models, as well as support for custom setup. The model used must support structured output.

Requires the note to have a fileClass (from the "Metadata Menu" plugin).

Uses the Metadata Menu API to get suggestions for valid property types and values. Currently supported value types are Select and Multi. Using dataview queries as a data source is not supported.

Value entry can be further restricted using whitelists and blacklists.

Dependencies: Requires the Metadata Menu and Dataview plugins (Dataview is a dependency of Metadata Menu).
