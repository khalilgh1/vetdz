import os
import json
import glob

class DocumentLoader:
    def __init__(self, data_dir=None):
        if data_dir is None:
            # Resolve data directory relative to this loader.py file
            self.data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
        else:
            self.data_dir = os.path.abspath(data_dir)

    def load_markdown(self):
        documents = []
        pattern = os.path.join(self.data_dir, "*.md")
        for filepath in glob.glob(pattern):
            filename = os.path.basename(filepath)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                documents.append({
                    "text": content,
                    "metadata": {
                        "source": filename,
                        "type": "markdown"
                    }
                })
            except Exception as e:
                print(f"Error loading {filepath}: {e}")
        return documents

    def load_products(self):
        documents = []
        filepath = os.path.join(self.data_dir, "products.json")
        if not os.path.exists(filepath):
            return documents
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                products = json.load(f)
            for product in products:
                text = self.product_to_text(product)
                documents.append({
                    "text": text,
                    "metadata": {
                        "source": "products.json",
                        "product_id": product.get("id"),
                        "slug": product.get("slug"),
                        "type": "product"
                    }
                })
        except Exception as e:
            print(f"Error loading {filepath}: {e}")
        return documents

    def product_to_text(self, product):
        name = product.get("nameAR", "")
        subtitle = product.get("subtitleAR", "")
        description = product.get("descriptionAR", "")
        price = product.get("price")
        discount_active = product.get("discountActive", False)
        discounted_price = product.get("discountedPrice")
        gender = product.get("gender", "")
        type_name = product.get("type_nameAR", "")
        
        # Map gender to Arabic
        gender_map = {
            "MALE": "رجالي",
            "FEMALE": "نسائي",
            "BOTH": "للجنسين"
        }
        gender_ar = gender_map.get(gender, gender)
        
        # Format price
        if discount_active and discounted_price is not None:
            price_str = f"{discounted_price} دج (سعر مخفض، السعر الأصلي: {price} دج)"
        else:
            price_str = f"{price} دج" if price is not None else "غير محدد"
            
        text_parts = [
            f"المنتج: {name}",
            f"الفئة: {type_name}" if type_name else "",
            f"المستهدف: {gender_ar}" if gender_ar else "",
            f"العنوان الفرعي: {subtitle}" if subtitle else "",
            f"الوصف: {description}" if description else "",
            f"السعر: {price_str}"
        ]
        
        # Add variations
        variations = product.get("variations", [])
        for var in variations:
            var_name = var.get("nameAr", var.get("name", ""))
            values = ", ".join(str(v) for v in var.get("values", []))
            if var_name and values:
                text_parts.append(f"{var_name}: {values}")
                
        # Filter empty lines and join
        return "\n".join([part for part in text_parts if part])

    def load_all(self):
        return self.load_markdown() + self.load_products()