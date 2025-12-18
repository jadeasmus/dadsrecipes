-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cuisine_type TEXT,
  main_ingredient TEXT,
  time_estimation INTEGER NOT NULL,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  servings INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create recipe_ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT,
  "order" INTEGER NOT NULL
);

-- Create recipe_instructions table
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_order ON recipe_ingredients(recipe_id, "order");
CREATE INDEX IF NOT EXISTS idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_instructions_order ON recipe_instructions(recipe_id, "order");

-- Enable RLS but allow public access (family use only)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read and write access
CREATE POLICY "Allow public read access on recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on recipes" ON recipes
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on recipe_ingredients" ON recipe_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on recipe_ingredients" ON recipe_ingredients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on recipe_ingredients" ON recipe_ingredients
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on recipe_ingredients" ON recipe_ingredients
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access on recipe_instructions" ON recipe_instructions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on recipe_instructions" ON recipe_instructions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on recipe_instructions" ON recipe_instructions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on recipe_instructions" ON recipe_instructions
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

