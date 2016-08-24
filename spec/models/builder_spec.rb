require 'rails_helper'

RSpec.describe Builder, type: :model do
  context 'file loading' do
    it 'should load files properly' do
      Builder.build
    end
  end
end
