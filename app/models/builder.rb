class Builder
  def initialize
    @section = nil
    @skills_list        = Hash.new
    @skills_advantage   = Hash.new
    @skills_open        = Hash.new

    file = File.open(Rails.root.join('db', 'raw', 'input.txt'))
    file.each_line do |line|
      parse_section line.strip
    end

    ap @skills_list
    ap @skills_advantage

    assert_all
  end

private
  def assert_all
    assert_advantage_skills
    assert_inclusive_skills
  end

  def assert_advantage_skills
    if @skills_advantage.keys.length == 20
      raise RuntimeError, "Advantage skills is #{@skills_advatage.keys.length} < 20"
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

    ap mismatches
    raise RuntimeError, "Mismatched skills exists" if mismatches.length != 0
  end

  def parse_section _x
    case _x
    when /\A\=\= ([\w\s]+) \=\=/
      @section = $1
    else
      case @section
      when /advantage skill/i
        parse_advantage_skill _x
      when /open skill/i
      when /skill list/i
        parse_skill_list _x
      end
    end
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

  def parse_skill_list _x
    @skills_list[_x.to_sym] = true
  end
end
