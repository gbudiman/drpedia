Rails.application.routes.draw do
  root                      to: 'tree#index'
  get      '/tree'        , to: 'tree#index'
  get      '/beta'        , to: 'tree#beta'
end
