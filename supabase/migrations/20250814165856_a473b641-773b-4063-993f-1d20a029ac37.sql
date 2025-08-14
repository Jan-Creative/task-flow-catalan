-- Eliminar la propietat incorrecta "26" i les seves dades associades
DELETE FROM task_properties WHERE property_id = '7b45508a-b565-4581-b91c-7d772fdbc1c7';
DELETE FROM property_options WHERE property_id = '7b45508a-b565-4581-b91c-7d772fdbc1c7';
DELETE FROM property_definitions WHERE id = '7b45508a-b565-4581-b91c-7d772fdbc1c7';