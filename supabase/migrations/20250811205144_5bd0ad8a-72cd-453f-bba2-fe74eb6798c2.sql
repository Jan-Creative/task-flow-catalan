-- Insert system properties for Estat and Prioritat
INSERT INTO property_definitions (name, type, icon, is_system, user_id) VALUES
('Estat', 'select', 'Circle', true, auth.uid()),
('Prioritat', 'select', 'Flag', true, auth.uid());

-- Insert default options for Estat
INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'pendent',
  'Pendent',
  '#64748b',
  0,
  true
FROM property_definitions pd WHERE pd.name = 'Estat' AND pd.user_id = auth.uid();

INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'en_proces',
  'En procés',
  '#3b82f6',
  1,
  false
FROM property_definitions pd WHERE pd.name = 'Estat' AND pd.user_id = auth.uid();

INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'completat',
  'Completat',
  '#10b981',
  2,
  false
FROM property_definitions pd WHERE pd.name = 'Estat' AND pd.user_id = auth.uid();

-- Insert default options for Prioritat
INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'baixa',
  'Baixa',
  '#64748b',
  0,
  false
FROM property_definitions pd WHERE pd.name = 'Prioritat' AND pd.user_id = auth.uid();

INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'mitjana',
  'Mitjana',
  '#f59e0b',
  1,
  true
FROM property_definitions pd WHERE pd.name = 'Prioritat' AND pd.user_id = auth.uid();

INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'alta',
  'Alta',
  '#ef4444',
  2,
  false
FROM property_definitions pd WHERE pd.name = 'Prioritat' AND pd.user_id = auth.uid();

INSERT INTO property_options (property_id, value, label, color, sort_order, is_default)
SELECT 
  pd.id,
  'urgent',
  'Urgent',
  '#dc2626',
  3,
  false
FROM property_definitions pd WHERE pd.name = 'Prioritat' AND pd.user_id = auth.uid();