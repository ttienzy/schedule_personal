-- Row Level Security Policies cho Supabase
-- Chạy trong Supabase SQL Editor

-- 1. Enable RLS trên tất cả bảng
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Categories — public read, admin write
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- 3. Schedules — owner full access, public read nếu is_shared = true
CREATE POLICY "Users can view their own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = owner_id OR is_shared = true);

CREATE POLICY "Users can insert their own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = owner_id);

-- 4. Slots — chỉ owner của schedule được thao tác
CREATE POLICY "Users can view slots of their schedules or shared schedules"
  ON slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND (schedules.owner_id = auth.uid() OR schedules.is_shared = true)
    )
  );

CREATE POLICY "Users can insert slots to their schedules"
  ON slots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update slots of their schedules"
  ON slots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete slots of their schedules"
  ON slots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

-- 5. Rules — tương tự slots
CREATE POLICY "Users can view rules of their schedules or shared schedules"
  ON rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND (schedules.owner_id = auth.uid() OR schedules.is_shared = true)
    )
  );

CREATE POLICY "Users can insert rules to their schedules"
  ON rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rules of their schedules"
  ON rules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rules of their schedules"
  ON rules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

-- 6. Trigger tự động update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
