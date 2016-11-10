Rails.application.routes.draw do
  root                      to: 'tree#index'
  get      '/tree'        , to: 'tree#index'
end
