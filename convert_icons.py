#!/usr/bin/env python3
"""
Script para convertir Bootstrap Icons a Material Icons en archivos HTML
"""
import os
import re
from pathlib import Path

# Mapeo de Bootstrap Icons a Material Icons
ICON_MAPPING = {
    'bi-plus-circle': 'add_circle',
    'bi-people': 'people',
    'bi-check-circle': 'check_circle',
    'bi-x-circle': 'cancel',
    'bi-star': 'star',
    'bi-search': 'search',
    'bi-pencil': 'edit',
    'bi-trash': 'delete',
    'bi-person-circle': 'account_circle',
    'bi-geo-alt': 'place',
    'bi-file-earmark-text': 'description',
    'bi-folder': 'folder',
    'bi-sticky': 'note',
    'bi-info-circle': 'info',
    'bi-currency-dollar': 'attach_money',
    'bi-arrow-right-circle': 'arrow_circle_right',
    'bi-clock-history': 'history',
    'bi-play-circle': 'play_circle',
    'bi-cash-stack': 'payments',
    'bi-list-ul': 'list',
    'bi-arrow-left': 'arrow_back',
    'bi-exclamation-triangle-fill': 'warning',
    'bi-exclamation-triangle': 'warning',
    'bi-box-seam': 'inventory_2',
    'bi-cash-coin': 'monetization_on',
    'bi-file-earmark-excel': 'file_download',
    'bi-clipboard-data': 'assessment',
    'bi-bar-chart': 'bar_chart',
    'bi-check-circle-fill': 'check_circle',
    'bi-hourglass-split': 'hourglass_empty',
    'bi-cart-check': 'shopping_cart_checkout',
    'bi-clock': 'schedule',
    'bi-truck': 'local_shipping',
    'bi-fuel-pump': 'local_gas_station',
    'bi-building': 'business',
    'bi-pin-map': 'location_on',
    'bi-layers': 'layers',
    'bi-tag': 'local_offer',
    'bi-chevron-right': 'chevron_right',
    'bi-chevron-up': 'expand_less',
    'bi-chevron-down': 'expand_more',
    'bi-arrow-down-circle': 'arrow_downward',
    'bi-arrow-up-circle': 'arrow_upward',
    'bi-arrow-right': 'arrow_forward',
    'bi-plus-minus': 'swap_vert',
    'bi-arrow-left-right': 'swap_horiz',
    'bi-calculator': 'calculate',
    'bi-clipboard-check': 'task',
    'bi-file-text': 'article',
}

def convert_icon_in_html(content):
    """Convierte los iconos de Bootstrap a Material Icons en contenido HTML"""
    changes_made = 0

    # Patrón para capturar <i class="bi bi-ICONNAME ..."></i>
    # Captura el nombre del icono y todas las clases adicionales
    pattern = r'<i\s+class="bi\s+(bi-[\w-]+)([^"]*)"[^>]*></i>'

    def replace_icon(match):
        nonlocal changes_made
        bi_class = match.group(1)  # bi-icon-name
        other_classes = match.group(2)  # otras clases (puede incluir espacios al inicio)

        if bi_class in ICON_MAPPING:
            material_icon = ICON_MAPPING[bi_class]
            # Mantener todas las clases adicionales excepto bi y bi-*
            additional_classes = ' '.join([c for c in other_classes.split() if not c.startswith('bi')])

            # Construir el nuevo tag
            if additional_classes:
                result = f'<mat-icon class="{additional_classes}">{material_icon}</mat-icon>'
            else:
                result = f'<mat-icon>{material_icon}</mat-icon>'

            changes_made += 1
            return result

        # Si no hay mapeo, devolver el original
        return match.group(0)

    new_content = re.sub(pattern, replace_icon, content)
    return new_content, changes_made

def process_html_files(directory):
    """Procesa todos los archivos HTML en un directorio"""
    html_files = Path(directory).rglob('*.html')
    files_modified = []
    total_changes = 0

    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content, changes = convert_icon_in_html(content)

            if changes > 0:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                files_modified.append((str(html_file), changes))
                total_changes += changes
                print(f"[OK] {html_file.relative_to(directory)}: {changes} iconos convertidos")

        except Exception as e:
            print(f"[ERROR] Error procesando {html_file}: {e}")

    return files_modified, total_changes

if __name__ == '__main__':
    base_dir = Path(__file__).parent
    pages_dir = base_dir / 'erp' / 'src' / 'app' / 'pages'
    components_dir = base_dir / 'erp' / 'src' / 'app' / 'components'

    print("=" * 60)
    print("Convirtiendo Bootstrap Icons a Material Icons")
    print("=" * 60)
    print()

    print("Procesando archivos en pages/...")
    pages_files, pages_changes = process_html_files(pages_dir)
    print()

    print("Procesando archivos en components/...")
    components_files, components_changes = process_html_files(components_dir)
    print()

    print("=" * 60)
    print(f"Resumen:")
    print(f"  - Archivos modificados en pages: {len(pages_files)}")
    print(f"  - Iconos convertidos en pages: {pages_changes}")
    print(f"  - Archivos modificados en components: {len(components_files)}")
    print(f"  - Iconos convertidos en components: {components_changes}")
    print(f"  - Total de archivos modificados: {len(pages_files) + len(components_files)}")
    print(f"  - Total de iconos convertidos: {pages_changes + components_changes}")
    print("=" * 60)
