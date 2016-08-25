require 'rails_helper'

RSpec.describe Skillset, type: :model do
  before :all do
    @skillset = Skillset.new(Builder.new.pack_data)
  end

  context 'query' do
    it 'should return existing skill correctly' do
      #ap @skillset
      @skillset.query 'Head Shrink'
    end
  end
end
