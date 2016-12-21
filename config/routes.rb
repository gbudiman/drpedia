Rails.application.routes.draw do
  root                      to: 'tree#beta'
  get      '/beta'        , to: 'tree#beta'
end
