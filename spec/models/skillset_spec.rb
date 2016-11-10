require 'rails_helper'

RSpec.describe Skillset, type: :model do
  before :all do
    @skillset = Skillset.new(Builder.new.pack_data)
  end

  # context 'query' do
  #   it 'should return existing skill correctly' do
  #     @skillset.query 'Head Shrink'
  #   end
  # end

  context 'json generation' do
    it 'should run correctly' do
      @skillset.generate_json
    end
  end
end
