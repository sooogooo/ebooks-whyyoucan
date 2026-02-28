/*
  # Add INSERT policy for chapters table

  1. Changes
    - Add policy to allow public INSERT on chapters table for seeding data
    - This is a temporary policy for initial data loading
  
  2. Notes
    - In production, you would want to restrict this to admin users only
    - For this demo, we allow public insert to enable seeding
*/

CREATE POLICY "Allow public to insert chapters"
  ON chapters FOR INSERT
  TO public
  WITH CHECK (true);
