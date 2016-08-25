class Skillset
  attr_reader :dataset

  def initialize _h
    @dataset = _h
    
    build
    #ap @dataset[:open]
    ap @dataset[:list]
  end

  def query _x
    x = _x.to_sym
    if has x
      ap query_by_strain(x)
    else
      return nil
    end
  end

  def query_by_strain _x
    result = Hash.new

    @dataset[:strain].each do |strain, _slist|
      if _slist[_x]
        result[strain] = _slist[_x]
      end
    end

    return result
  end

private
  def has _x
    return @dataset[:list][_x] != nil
  end

  def build
    @dataset[:list].each do |k, v|
      @dataset[:list][k] = {
        job: Hash.new,
        strain: Hash.new
      }
      x = @dataset[:list][k]

      x[:open] = @dataset[:open][k] || nil
      @dataset[:strain].each do |job, _slist|
        if _slist[k]
          x[:job][job] = _slist[k][:cost]
        end
      end

      @dataset[:advantage].each do |strain, _slist|
        if _slist[k]
          x[:strain][strain] = 3
        end
      end
    end
  end
end