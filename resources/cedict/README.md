# CC-CEDICT runtime data

These compressed lookup shards are generated from CC-CEDICT using the pinned `cc-cedict`
development dependency. They keep production dictionary lookup memory-safe and reproducible.

- Source: [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict)
- Data license: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- Generator: `npm run dictionary:build`

Do not edit the generated `.json.gz` files by hand. Attribution must remain visible anywhere
the dictionary data is presented to users.
