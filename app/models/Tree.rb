class Tree
  def self.generate

    Builder.build(input: Rails.root.join('public', 'input.txt'), 
                  base_output_path: Rails.root.join('public'))
  end
end