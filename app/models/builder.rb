class Builder
  def initialize
    @section = nil
    @skills_list        = Hash.new
    @skills_advantage   = Hash.new
    @skills_open        = Hash.new
    @skills_by_strain   = Hash.new

    file = File.open(Rails.root.join('db', 'raw', 'input.txt'))
    file.each_line do |line|
      parse_section line.strip
    end

    #ap @skills_list
    #ap @skills_advantage
    ap @skills_by_strain

    assert_all
  end

private
  def assert_all
    assert_advantage_skills
    assert_inclusive_skills
    assert_strain_count
  end

  def assert_advantage_skills
    if @skills_advantage.keys.length == 20
      raise RuntimeError, "Advantage skills is #{@skills_advatage.keys.length} < 20"
    end
  end

  def assert_strain_count
    if @skills_by_strain.keys.length != 38
      raise RuntimeError, "Strain count is #{@skills_advatage.keys.length} != 38"
    end
  end

  def assert_inclusive_skills
    mismatches = Array.new

    @skills_advantage.each do |strain, sdv|
      sdv.keys.each do |skill|
        if @skills_list[skill] == nil
          mismatches.push([strain, skill])
        end
      end
    end

    @skills_open.each do |skill, cost|
      if @skills_list[skill] == nil
        mismatches.push(['open', skill])
      end
    end

    @skills_by_strain.each do |strain, sdv|
      sdv.each do |skill, sdd|
        if @skills_list[skill] == nil
          mismatches.push([strain, skill])
        end

        next if sdd[:preq] == nil

        sdd[:preq][:list].each do |preq|
          if @skills_list[preq] == nil
            mismatches.push(["#{strain}/#{skill}/preq", preq])
          end
        end
      end
    end

    ap mismatches
    raise RuntimeError, "Mismatched skills exists" if mismatches.length != 0
  end

  def parse_section _x
    case _x
    when /\A\=\= ([\w\s\-]+) \=\=/
      @section = $1.to_sym
    else
      case @section
      when /advantage skill/i
        parse_advantage_skill _x
      when /open skill/i
        parse_open_skill _x
      when /skill list/i
        parse_skill_list _x
      else
        parse_strain_specific_skill _x
      end
    end
  end

  def parse_strain_specific_skill _x
    @skills_by_strain[@section] ||= Hash.new

    parts = _x.split(/\d+/)
    return if parts.length < 1

    _x =~ /(\d+)/
    skill = parts[0].strip.to_sym
    cost = $1.to_i
    @skills_by_strain[@section][skill] = {
      cost: cost,
      preq: process_preq(parts[1])
    }
  end

  def process_preq _x
    return nil unless _x

    list = Array.new
    if _x =~ /\|/
      predicate = :or
    elsif _x =~ /\&/
      predicate = :and
    end

    _x.split(/[\|\&]/).each do |preq|
      list.push preq.strip.to_sym
    end

    return {
      predicate: predicate || nil,
      list: list
    }
  end

  def parse_advantage_skill _x
    parts = _x.split(/\:/)
    return if parts.length != 2
    strain = parts[0].strip

    @skills_advantage[strain] = Hash.new
    parts[1].split(/\,/).each do |skill|
      if skill.strip =~ /\Alore - /i
        filtered_skill = 'Lore'.to_sym
      else
        filtered_skill = skill.strip.to_sym
      end

      @skills_advantage[strain][filtered_skill] = true
    end
  end

  def parse_open_skill _x
    if _x =~ /(\d+)/
      parts = _x.split(/\d+/)

      skill = parts[0].strip.to_sym
      cost = _x.to_i

      @skills_open[skill] = cost
    end
  end

  def parse_skill_list _x
    @skills_list[_x.to_sym] = true
  end
end
