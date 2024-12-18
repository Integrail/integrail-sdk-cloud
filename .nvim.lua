local is_vanilla = not vim.g.vscode
local is_vscode = not not vim.g.vscode

local function contains(list, str)
  for _, value in ipairs(list) do
    if value == str then
      return true
    end
  end
  return false
end

if is_vanilla then
  require('luasnip.loaders.from_snipmate').lazy_load({ paths = { '.snippets' } })

  vim.api.nvim_create_autocmd('BufWritePre', {
    callback = function()
      local mode = vim.api.nvim_get_mode().mode
      local filetype = vim.bo.filetype
      if vim.bo.modified == true and mode == 'n' and contains({ 'typescript', 'javascript' }, filetype) then
        vim.lsp.buf.format({ name = 'eslint' })
      else
      end
    end
  })
end

