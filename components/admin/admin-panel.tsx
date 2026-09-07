"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin-panel.module.css";

type TabKey = "products" | "types" | "variations" | "testimonials";

type ProductTypeItem = {
    id: number;
    slug: string;
    nameAr: string;
    _count: {
        products: number;
        variations: number;
    };
};

type VariationValueItem = {
    id: number;
    valueAr: string;
    hexColor: string | null;
};

type VariationItem = {
    id: number;
    nameAr: string;
    productTypeId: number;
    productType: {
        id: number;
        slug: string;
        nameAr: string;
    };
    values: VariationValueItem[];
};

type ProductVariationSelection = {
    valueId: number;
    valueAr: string;
    hexColor: string | null;
    variationId: number;
    variationNameAr: string;
};

type ProductItem = {
    id: number;
    slug: string;
    nameAr: string;
    nameEn: string;
    subtitleAr: string;
    subtitleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    gender: "MALE" | "FEMALE" | "BOTH";
    productTypeId: number;
    productTypeNameAr: string;
    productTypeNameEn?: string;
    price: number;
    discountActive: boolean;
    discountedPrice: number | null;
    isFeatured: boolean;
    imageUrls: string[];
    variationValueIds: number[];
    selectedVariations: ProductVariationSelection[];
};

type TestimonialItem = {
    id: number;
    nameAr: string;
    roleAr: string;
    textAr: string;
    rating: number;
};

type ApiError = {
    error?: string;
};

type UploadItem = {
    url: string;
    publicId: string;
};

type DeleteDialogState = {
    title: string;
    description: string;
    successText: string;
    busyKey: string;
    url: string;
};

const ADMIN_UNAUTHORIZED_ERROR = "ADMIN_UNAUTHORIZED";

const TABS: { key: TabKey; label: string; labelEn: string; description: string; descriptionEn: string }[] = [
    { key: "products", label: "المنتجات", labelEn: "Products", description: "إنشاء وتعديل منتجات المتجر", descriptionEn: "Manage catalog products & pricing" },
    { key: "types", label: "الأنواع", labelEn: "Categories", description: "إدارة أنواع المنتجات (الفئات)", descriptionEn: "Manage product categories & slugs" },
    { key: "variations", label: "المتغيرات", labelEn: "Variations", description: "نوع -> متغير -> قيم -> ربط بالمنتج", descriptionEn: "Attributes, values & product links" },
    { key: "testimonials", label: "الآراء", labelEn: "Reviews", description: "إدارة آراء العملاء", descriptionEn: "Customer testimonials & ratings" },
];

function toErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    return "حدث خطأ غير متوقع";
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });

    const data = (await response.json().catch(() => ({}))) as T & ApiError;

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(ADMIN_UNAUTHORIZED_ERROR);
        }

        throw new Error(data.error || "فشل تنفيذ الطلب");
    }

    return data;
}

function formatPrice(value: number | null) {
    if (value === null) {
        return "-";
    }

    return new Intl.NumberFormat("ar-DZ").format(value);
}

async function uploadImagesToCloudinary(files: File[]) {
    const formData = new FormData();

    for (const file of files) {
        formData.append("images", file);
    }

    const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
    });

    const data = (await response.json().catch(() => ({}))) as { items?: UploadItem[]; error?: string };

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(ADMIN_UNAUTHORIZED_ERROR);
        }

        throw new Error(data.error || "فشل رفع الصور إلى Cloudinary");
    }

    return (data.items || []).map((item) => item.url);
}

type AdminPanelProps = {
    locale?: "ar" | "en";
};

export function AdminPanel({ locale = "ar" }: AdminPanelProps) {
    const isEn = locale === "en";
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabKey>("products");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);

    const [productTypes, setProductTypes] = useState<ProductTypeItem[]>([]);
    const [variations, setVariations] = useState<VariationItem[]>([]);
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

    const [editingProductTypeId, setEditingProductTypeId] = useState<number | null>(null);
    const [productTypeForm, setProductTypeForm] = useState({
        slug: "",
        nameAr: "",
    });

    const [editingVariationId, setEditingVariationId] = useState<number | null>(null);
    const [variationForm, setVariationForm] = useState({
        productTypeId: "",
        nameAr: "",
    });

    const [editingVariationValueId, setEditingVariationValueId] = useState<number | null>(null);
    const [variationValueForm, setVariationValueForm] = useState({
        variationId: "",
        valueAr: "",
        hexColor: "",
    });

    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [productForm, setProductForm] = useState({
        slug: "",
        nameAr: "",
        nameEn: "",
        subtitleAr: "",
        subtitleEn: "",
        descriptionAr: "",
        descriptionEn: "",
        price: "",
        discountActive: false,
        discountedPrice: "",
        gender: "BOTH" as "MALE" | "FEMALE" | "BOTH",
        isFeatured: false,
        productTypeId: "",
        imageUrls: [] as string[],
        variationValueIds: [] as number[],
    });

    const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
    const [testimonialForm, setTestimonialForm] = useState({
        nameAr: "",
        roleAr: "",
        textAr: "",
        rating: "5",
    });

    const handleUnauthorizedError = useCallback((error: unknown) => {
        if (error instanceof Error && error.message === ADMIN_UNAUTHORIZED_ERROR) {
            router.replace("/admin/login");
            return true;
        }

        return false;
    }, [router]);

    const loadData = useCallback(async (usePageLoader = false) => {
        if (usePageLoader) {
            setLoading(true);
        }

        try {
            const [typesResponse, variationsResponse, productsResponse, testimonialsResponse] = await Promise.all([
                requestJson<{ items: ProductTypeItem[] }>("/api/admin/product-types"),
                requestJson<{ items: VariationItem[] }>("/api/admin/variations"),
                requestJson<{ items: ProductItem[] }>("/api/admin/products"),
                requestJson<{ items: TestimonialItem[] }>("/api/admin/testimonials"),
            ]);

            setProductTypes(typesResponse.items);
            setVariations(variationsResponse.items);
            setProducts(productsResponse.items);
            setTestimonials(testimonialsResponse.items);
        } catch (error) {
            if (handleUnauthorizedError(error)) {
                return;
            }

            setMessage({
                type: "error",
                text: toErrorMessage(error),
            });
        } finally {
            if (usePageLoader) {
                setLoading(false);
            }
        }
    }, [handleUnauthorizedError]);

    useEffect(() => {
        void loadData(true);
    }, [loadData]);

    useEffect(() => {
        if (productTypes.length === 0) {
            return;
        }

        setVariationForm((current) => {
            if (current.productTypeId) {
                return current;
            }

            return {
                ...current,
                productTypeId: String(productTypes[0].id),
            };
        });

        setProductForm((current) => {
            if (current.productTypeId) {
                return current;
            }

            return {
                ...current,
                productTypeId: String(productTypes[0].id),
            };
        });
    }, [productTypes]);

    useEffect(() => {
        if (variations.length === 0) {
            return;
        }

        setVariationValueForm((current) => {
            if (current.variationId) {
                return current;
            }

            return {
                ...current,
                variationId: String(variations[0].id),
            };
        });
    }, [variations]);

    const variationsForSelectedType = useMemo(() => {
        const selectedTypeId = Number(productForm.productTypeId);

        if (!Number.isInteger(selectedTypeId) || selectedTypeId <= 0) {
            return [];
        }

        return variations.filter((variation) => variation.productTypeId === selectedTypeId);
    }, [productForm.productTypeId, variations]);

    useEffect(() => {
        const allowedValueIds = new Set(
            variationsForSelectedType.flatMap((variation) => variation.values.map((value) => value.id))
        );

        setProductForm((current) => {
            const filteredIds = current.variationValueIds.filter((id) => allowedValueIds.has(id));

            if (filteredIds.length === current.variationValueIds.length) {
                return current;
            }

            return {
                ...current,
                variationValueIds: filteredIds,
            };
        });
    }, [variationsForSelectedType]);

    async function withBusy(key: string, action: () => Promise<void>, successMessage: string) {
        setBusy(key);
        setMessage(null);

        try {
            await action();
            await loadData(false);
            setMessage({ type: "success", text: successMessage });
        } catch (error) {
            if (handleUnauthorizedError(error)) {
                return;
            }

            setMessage({ type: "error", text: toErrorMessage(error) });
        } finally {
            setBusy(null);
        }
    }

    function resetProductTypeForm() {
        setEditingProductTypeId(null);
        setProductTypeForm({ slug: "", nameAr: "" });
    }

    function resetVariationForm() {
        setEditingVariationId(null);
        setVariationForm((current) => ({
            productTypeId: current.productTypeId || (productTypes[0] ? String(productTypes[0].id) : ""),
            nameAr: "",
        }));
    }

    function resetVariationValueForm() {
        setEditingVariationValueId(null);
        setVariationValueForm((current) => ({
            variationId: current.variationId || (variations[0] ? String(variations[0].id) : ""),
            valueAr: "",
            hexColor: "",
        }));
    }

    function resetProductForm() {
        setEditingProductId(null);
        setProductForm({
            slug: "",
            nameAr: "",
            nameEn: "",
            subtitleAr: "",
            subtitleEn: "",
            descriptionAr: "",
            descriptionEn: "",
            price: "",
            discountActive: false,
            discountedPrice: "",
            gender: "BOTH",
            isFeatured: false,
            productTypeId: productTypes[0] ? String(productTypes[0].id) : "",
            imageUrls: [],
            variationValueIds: [],
        });
    }

    function resetTestimonialForm() {
        setEditingTestimonialId(null);
        setTestimonialForm({
            nameAr: "",
            roleAr: "",
            textAr: "",
            rating: "5",
        });
    }

    function startEditProduct(item: ProductItem) {
        setActiveTab("products");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setEditingProductId(item.id);
        setProductForm({
            slug: item.slug,
            nameAr: item.nameAr,
            nameEn: item.nameEn || "",
            subtitleAr: item.subtitleAr,
            subtitleEn: item.subtitleEn || "",
            descriptionAr: item.descriptionAr,
            descriptionEn: item.descriptionEn || "",
            price: String(item.price),
            discountActive: item.discountActive,
            discountedPrice: item.discountedPrice === null ? "" : String(item.discountedPrice),
            gender: item.gender,
            isFeatured: item.isFeatured,
            productTypeId: String(item.productTypeId),
            imageUrls: item.imageUrls,
            variationValueIds: item.variationValueIds,
        });
    }

    function startEditProductType(item: ProductTypeItem) {
        setActiveTab("types");
        setEditingProductTypeId(item.id);
        setProductTypeForm({ slug: item.slug, nameAr: item.nameAr });
    }

    function startEditVariation(item: VariationItem) {
        setActiveTab("variations");
        setEditingVariationId(item.id);
        setVariationForm({
            productTypeId: String(item.productTypeId),
            nameAr: item.nameAr,
        });
    }

    function startEditVariationValue(variation: VariationItem, value: VariationValueItem) {
        setActiveTab("variations");
        setEditingVariationValueId(value.id);
        setVariationValueForm({
            variationId: String(variation.id),
            valueAr: value.valueAr,
            hexColor: value.hexColor || "",
        });
    }

    function startEditTestimonial(item: TestimonialItem) {
        setActiveTab("testimonials");
        setEditingTestimonialId(item.id);
        setTestimonialForm({
            nameAr: item.nameAr,
            roleAr: item.roleAr,
            textAr: item.textAr,
            rating: String(item.rating),
        });
    }

    function toggleVariationValue(valueId: number) {
        setProductForm((current) => {
            const exists = current.variationValueIds.includes(valueId);

            return {
                ...current,
                variationValueIds: exists
                    ? current.variationValueIds.filter((id) => id !== valueId)
                    : [...current.variationValueIds, valueId],
            };
        });
    }

    function removeProductImage(url: string) {
        setProductForm((current) => ({
            ...current,
            imageUrls: current.imageUrls.filter((item) => item !== url),
        }));
    }

    async function handleProductImageSelection(event: React.ChangeEvent<HTMLInputElement>) {
        const inputElement = event.currentTarget;
        const fileList = inputElement.files;

        if (!fileList || fileList.length === 0) {
            return;
        }

        const files = Array.from(fileList);

        // Clear immediately so the same file can be reselected later.
        inputElement.value = "";

        setIsUploadingImages(true);
        setMessage(null);

        try {
            const uploadedUrls = await uploadImagesToCloudinary(files);

            if (uploadedUrls.length === 0) {
                throw new Error("لم يتم استلام روابط الصور من الخادم بعد الرفع.");
            }

            setProductForm((current) => ({
                ...current,
                imageUrls: Array.from(new Set([...current.imageUrls, ...uploadedUrls])),
            }));

            setMessage({ type: "success", text: "تم رفع الصور إلى Cloudinary بنجاح" });
        } catch (error) {
            setMessage({ type: "error", text: toErrorMessage(error) });
        } finally {
            setIsUploadingImages(false);
        }
    }

    function openDeleteDialog(config: DeleteDialogState) {
        setDeleteDialog(config);
    }

    async function confirmDeleteDialog() {
        if (!deleteDialog) {
            return;
        }

        const current = deleteDialog;

        await withBusy(
            current.busyKey,
            async () => {
                await requestJson(current.url, { method: "DELETE" });
            },
            current.successText
        );

        setDeleteDialog(null);
    }

    async function handleProductTypeSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = {
            slug: productTypeForm.slug,
            nameAr: productTypeForm.nameAr,
        };

        if (editingProductTypeId) {
            await withBusy(
                "save-type",
                async () => {
                    await requestJson(`/api/admin/product-types/${editingProductTypeId}`, {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    });
                },
                "تم تعديل نوع المنتج بنجاح"
            );
        } else {
            await withBusy(
                "save-type",
                async () => {
                    await requestJson("/api/admin/product-types", {
                        method: "POST",
                        body: JSON.stringify(payload),
                    });
                },
                "تم إنشاء نوع المنتج"
            );
        }

        resetProductTypeForm();
    }

    async function handleVariationSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = {
            productTypeId: Number(variationForm.productTypeId),
            nameAr: variationForm.nameAr,
        };

        if (editingVariationId) {
            await withBusy(
                "save-variation",
                async () => {
                    await requestJson(`/api/admin/variations/${editingVariationId}`, {
                        method: "PATCH",
                        body: JSON.stringify({ nameAr: payload.nameAr }),
                    });
                },
                "تم تعديل المتغير"
            );
        } else {
            await withBusy(
                "save-variation",
                async () => {
                    await requestJson("/api/admin/variations", {
                        method: "POST",
                        body: JSON.stringify(payload),
                    });
                },
                "تم إنشاء المتغير"
            );
        }

        resetVariationForm();
    }

    async function handleVariationValueSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = {
            variationId: Number(variationValueForm.variationId),
            valueAr: variationValueForm.valueAr,
            hexColor: variationValueForm.hexColor,
        };

        if (editingVariationValueId) {
            await withBusy(
                "save-variation-value",
                async () => {
                    await requestJson(`/api/admin/variation-values/${editingVariationValueId}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                            valueAr: payload.valueAr,
                            hexColor: payload.hexColor,
                        }),
                    });
                },
                "تم تعديل قيمة المتغير"
            );
        } else {
            await withBusy(
                "save-variation-value",
                async () => {
                    await requestJson("/api/admin/variation-values", {
                        method: "POST",
                        body: JSON.stringify(payload),
                    });
                },
                "تمت إضافة قيمة المتغير"
            );
        }

        resetVariationValueForm();
    }

    async function handleProductSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = {
            slug: productForm.slug,
            nameAr: productForm.nameAr,
            nameEn: productForm.nameEn,
            subtitleAr: productForm.subtitleAr,
            subtitleEn: productForm.subtitleEn,
            descriptionAr: productForm.descriptionAr,
            descriptionEn: productForm.descriptionEn,
            price: productForm.price,
            discountActive: productForm.discountActive,
            discountedPrice: productForm.discountActive ? productForm.discountedPrice : null,
            gender: productForm.gender,
            isFeatured: productForm.isFeatured,
            productTypeId: Number(productForm.productTypeId),
            imageUrls: productForm.imageUrls,
            variationValueIds: productForm.variationValueIds,
        };

        if (editingProductId) {
            await withBusy(
                "save-product",
                async () => {
                    await requestJson(`/api/admin/products/${editingProductId}`, {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    });
                },
                "تم تعديل المنتج"
            );
        } else {
            await withBusy(
                "save-product",
                async () => {
                    await requestJson("/api/admin/products", {
                        method: "POST",
                        body: JSON.stringify(payload),
                    });
                },
                "تم إنشاء المنتج"
            );
        }

        resetProductForm();
    }

    async function handleTestimonialSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const payload = {
            nameAr: testimonialForm.nameAr,
            roleAr: testimonialForm.roleAr,
            textAr: testimonialForm.textAr,
            rating: Number(testimonialForm.rating),
        };

        if (editingTestimonialId) {
            await withBusy(
                "save-testimonial",
                async () => {
                    await requestJson(`/api/admin/testimonials/${editingTestimonialId}`, {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    });
                },
                "تم تعديل الرأي"
            );
        } else {
            await withBusy(
                "save-testimonial",
                async () => {
                    await requestJson("/api/admin/testimonials", {
                        method: "POST",
                        body: JSON.stringify(payload),
                    });
                },
                "تم إضافة الرأي"
            );
        }

        resetTestimonialForm();
    }

    if (loading) {
        return <div className={styles.loading}>{isEn ? "Loading administration console..." : "جارٍ تحميل لوحة التحكم..."}</div>;
    }

    const isDeleteBusy = Boolean(deleteDialog && busy === deleteDialog.busyKey);

    return (
        <section className={styles.wrapper}>
            <div className={styles.hero}>
                <p>{isEn ? "VETDZ ADMINISTRATION PORTAL" : "لوحة إدارة VetDz"}</p>
                <h1>{isEn ? "Catalog, Variations & Reviews Console" : "تحكم كامل في المنتجات والمتغيرات والآراء"}</h1>
                <span>
                    {isEn
                        ? "Manage your luxury catalog effortlessly: configure categories, dynamic attributes with colors, rich product details, and verified customer testimonials."
                        : "الواجهة مبنية حول مخطط قاعدة البيانات: كل نوع منتج يمتلك عدة متغيرات، وكل متغير يمتلك قيمًا متعددة، والمنتجات ترتبط بقيم المتغيرات عبر ProductVariation."}
                </span>
            </div>

            <div className={styles.tabs}>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <strong>{isEn ? tab.labelEn : tab.label}</strong>
                        <span>{isEn ? tab.descriptionEn : tab.description}</span>
                    </button>
                ))}
            </div>

            {message ? (
                <div className={`${styles.feedback} ${message.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>
                    {message.text}
                </div>
            ) : null}

            {activeTab === "types" ? (
                <div className={styles.sectionGrid}>
                    <form className={styles.card} onSubmit={handleProductTypeSubmit}>
                        <div className={styles.cardHeader}>
                            <h2>{editingProductTypeId ? (isEn ? "Edit Category" : "تعديل نوع") : (isEn ? "Add New Category" : "إضافة نوع جديد")}</h2>
                            <p>{isEn ? "Examples: toppings, leggings, shoes" : "أمثلة: toppings, leggings, shoes"}</p>
                        </div>

                        <label className={styles.field}>
                            <span>Slug</span>
                            <input
                                value={productTypeForm.slug}
                                onChange={(event) =>
                                    setProductTypeForm((current) => ({
                                        ...current,
                                        slug: event.target.value,
                                    }))
                                }
                                placeholder="toppings"
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "Category Name (Arabic)" : "الاسم بالعربية"}</span>
                            <input
                                value={productTypeForm.nameAr}
                                onChange={(event) =>
                                    setProductTypeForm((current) => ({
                                        ...current,
                                        nameAr: event.target.value,
                                    }))
                                }
                                placeholder={isEn ? "e.g. Shirts" : "أقمصة"}
                                required
                            />
                        </label>

                        <div className={styles.formActions}>
                            <button className={styles.primaryButton} type="submit" disabled={busy !== null}>
                                {busy === "save-type"
                                    ? (isEn ? "Saving..." : "جارٍ الحفظ...")
                                    : editingProductTypeId
                                        ? (isEn ? "Save Changes" : "حفظ التعديل")
                                        : (isEn ? "Add Category" : "إضافة النوع")}
                            </button>
                            {editingProductTypeId ? (
                                <button className={styles.ghostButton} type="button" onClick={resetProductTypeForm}>
                                    {isEn ? "Cancel" : "إلغاء"}
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>{isEn ? "Product Categories" : "أنواع المنتجات"}</h2>
                            <p>{productTypes.length} {isEn ? "categories" : "نوع"}</p>
                        </div>

                        <div className={styles.list}>
                            {productTypes.map((item) => (
                                <article key={item.id} className={styles.listItem}>
                                    <div>
                                        <strong>{item.nameAr}</strong>
                                        <span>slug: {item.slug}</span>
                                        <small>
                                            {isEn ? `Products: ${item._count.products} | Variations: ${item._count.variations}` : `منتجات: ${item._count.products} | متغيرات: ${item._count.variations}`}
                                        </small>
                                    </div>

                                    <div className={styles.inlineActions}>
                                        <button type="button" className={styles.ghostButton} onClick={() => startEditProductType(item)}>
                                            {isEn ? "Edit" : "تعديل"}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() =>
                                                openDeleteDialog({
                                                    title: isEn ? "Confirm Category Deletion" : "تأكيد حذف نوع المنتج",
                                                    description: isEn ? "Deletion will be rejected if the category is currently attached to existing products." : "سيتم رفض الحذف إذا كان النوع مرتبطًا بمنتجات حالية.",
                                                    successText: isEn ? "Category deleted successfully" : "تم حذف نوع المنتج",
                                                    busyKey: `delete-type-${item.id}`,
                                                    url: `/api/admin/product-types/${item.id}`,
                                                })
                                            }
                                            disabled={busy !== null}
                                        >
                                            {isEn ? "Delete" : "حذف"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "variations" ? (
                <div className={styles.sectionGridWide}>
                    <form className={styles.card} onSubmit={handleVariationSubmit}>
                        <div className={styles.cardHeader}>
                            <h2>{editingVariationId ? (isEn ? "Edit Variation" : "تعديل متغير") : (isEn ? "Add Variation" : "إضافة متغير")}</h2>
                            <p>{isEn ? "A variation is linked directly to a product category" : "المتغير مرتبط مباشرة بنوع المنتج"}</p>
                        </div>

                        <label className={styles.field}>
                            <span>{isEn ? "Product Category" : "نوع المنتج"}</span>
                            <select
                                value={variationForm.productTypeId}
                                onChange={(event) =>
                                    setVariationForm((current) => ({
                                        ...current,
                                        productTypeId: event.target.value,
                                    }))
                                }
                                disabled={editingVariationId !== null}
                                required
                            >
                                {productTypes.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nameAr}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "Variation Name" : "اسم المتغير"}</span>
                            <input
                                value={variationForm.nameAr}
                                onChange={(event) =>
                                    setVariationForm((current) => ({
                                        ...current,
                                        nameAr: event.target.value,
                                    }))
                                }
                                placeholder={isEn ? "e.g. Size or Color" : "المقاس"}
                                required
                            />
                        </label>

                        <div className={styles.formActions}>
                            <button className={styles.primaryButton} type="submit" disabled={busy !== null}>
                                {busy === "save-variation"
                                    ? (isEn ? "Saving..." : "جارٍ الحفظ...")
                                    : editingVariationId
                                        ? (isEn ? "Save Variation" : "حفظ المتغير")
                                        : (isEn ? "Add Variation" : "إضافة المتغير")}
                            </button>
                            {editingVariationId ? (
                                <button className={styles.ghostButton} type="button" onClick={resetVariationForm}>
                                    {isEn ? "Cancel" : "إلغاء"}
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <form className={styles.card} onSubmit={handleVariationValueSubmit}>
                        <div className={styles.cardHeader}>
                            <h2>{editingVariationValueId ? (isEn ? "Edit Value" : "تعديل قيمة") : (isEn ? "Add Variation Value" : "إضافة قيمة متغير")}</h2>
                            <p>{isEn ? "Each variation contains multiple values (e.g. S / M / L or colors)" : "كل متغير يملك عدة قيم (مثال: S / M / L)"}</p>
                        </div>

                        <label className={styles.field}>
                            <span>{isEn ? "Variation Group" : "المتغير"}</span>
                            <select
                                value={variationValueForm.variationId}
                                onChange={(event) =>
                                    setVariationValueForm((current) => ({
                                        ...current,
                                        variationId: event.target.value,
                                    }))
                                }
                                disabled={editingVariationValueId !== null}
                                required
                            >
                                {variations.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.productType.nameAr} / {item.nameAr}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "Value Label" : "القيمة"}</span>
                            <input
                                value={variationValueForm.valueAr}
                                onChange={(event) =>
                                    setVariationValueForm((current) => ({
                                        ...current,
                                        valueAr: event.target.value,
                                    }))
                                }
                                placeholder={isEn ? "e.g. M or Noir" : "M"}
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "HEX Color (Optional)" : "لون HEX (اختياري)"}</span>
                            <input
                                value={variationValueForm.hexColor}
                                onChange={(event) =>
                                    setVariationValueForm((current) => ({
                                        ...current,
                                        hexColor: event.target.value,
                                    }))
                                }
                                placeholder="#111827"
                            />
                        </label>

                        <div className={styles.formActions}>
                            <button className={styles.primaryButton} type="submit" disabled={busy !== null}>
                                {busy === "save-variation-value"
                                    ? (isEn ? "Saving..." : "جارٍ الحفظ...")
                                    : editingVariationValueId
                                        ? (isEn ? "Save Value" : "حفظ القيمة")
                                        : (isEn ? "Add Value" : "إضافة القيمة")}
                            </button>
                            {editingVariationValueId ? (
                                <button className={styles.ghostButton} type="button" onClick={resetVariationValueForm}>
                                    {isEn ? "Cancel" : "إلغاء"}
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <div className={`${styles.card} ${styles.spanTwo}`}>
                        <div className={styles.cardHeader}>
                            <h2>{isEn ? "Variations & Attributes" : "المتغيرات والقيم"}</h2>
                            <p>{variations.length} {isEn ? "variations configured" : "متغير"}</p>
                        </div>

                        <div className={styles.list}>
                            {variations.map((variation) => (
                                <article key={variation.id} className={styles.variationItem}>
                                    <div className={styles.variationTop}>
                                        <div>
                                            <strong>{variation.nameAr}</strong>
                                            <span>
                                                {isEn ? `Category: ${variation.productType.nameAr} (${variation.productType.slug})` : `النوع: ${variation.productType.nameAr} (${variation.productType.slug})`}
                                            </span>
                                        </div>
                                        <div className={styles.inlineActions}>
                                            <button
                                                type="button"
                                                className={styles.ghostButton}
                                                onClick={() => startEditVariation(variation)}
                                            >
                                                {isEn ? "Edit" : "تعديل"}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.dangerButton}
                                                onClick={() =>
                                                    openDeleteDialog({
                                                        title: isEn ? "Confirm Variation Deletion" : "تأكيد حذف المتغير",
                                                        description: isEn ? "All values associated with this variation will be permanently deleted." : "سيتم حذف جميع القيم المرتبطة بهذا المتغير.",
                                                        successText: isEn ? "Variation deleted successfully" : "تم حذف المتغير",
                                                        busyKey: `delete-variation-${variation.id}`,
                                                        url: `/api/admin/variations/${variation.id}`,
                                                    })
                                                }
                                                disabled={busy !== null}
                                            >
                                                {isEn ? "Delete" : "حذف"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.valuesWrap}>
                                        {variation.values.map((value) => (
                                            <div key={value.id} className={styles.valueChip}>
                                                <span className={styles.valueContent}>
                                                    {value.valueAr}
                                                    {value.hexColor ? <small className={styles.hexValue}>{value.hexColor}</small> : null}
                                                </span>
                                                <div className={styles.inlineActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.ghostButton}
                                                        onClick={() => startEditVariationValue(variation, value)}
                                                    >
                                                        {isEn ? "Edit" : "تعديل"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.dangerButton}
                                                        onClick={() =>
                                                            openDeleteDialog({
                                                                title: isEn ? "Confirm Value Deletion" : "تأكيد حذف قيمة المتغير",
                                                                description: isEn ? "This value will be unlinked from all connected products." : "سيتم إزالة هذه القيمة من جميع روابط المنتجات.",
                                                                successText: isEn ? "Value deleted successfully" : "تم حذف قيمة المتغير",
                                                                busyKey: `delete-variation-value-${value.id}`,
                                                                url: `/api/admin/variation-values/${value.id}`,
                                                            })
                                                        }
                                                        disabled={busy !== null}
                                                    >
                                                        {isEn ? "Delete" : "حذف"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "products" ? (
                <div className={styles.sectionGridWide}>
                    <form className={`${styles.card} ${styles.spanTwo}`} onSubmit={handleProductSubmit}>
                        <div className={styles.cardHeader}>
                            <h2>{editingProductId ? (isEn ? "Edit Product" : "تعديل منتج") : (isEn ? "Add New Product" : "إضافة منتج")}</h2>
                            <p>{isEn ? "Select the category first, then attach the relevant variation values" : "حدد النوع أولًا، ثم اختر قيم المتغيرات الموافقة له"}</p>
                        </div>

                        <div className={styles.formGrid}>
                            <label className={styles.field}>
                                <span>Slug</span>
                                <input
                                    value={productForm.slug}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            slug: event.target.value,
                                        }))
                                    }
                                    placeholder="nomad-sculpted-overshirt"
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Product Name (Arabic)" : "اسم المنتج (بالعربية)"}</span>
                                <input
                                    value={productForm.nameAr}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            nameAr: event.target.value,
                                        }))
                                    }
                                    placeholder={isEn ? "e.g. قميص صوف خفيف" : "مثال: قميص صوف خفيف"}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Product Name (English)" : "اسم المنتج (بالإنجليزية)"}</span>
                                <input
                                    value={productForm.nameEn}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            nameEn: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. Sculpted Wool Overshirt"
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Subtitle (Arabic)" : "عنوان فرعي (بالعربية)"}</span>
                                <input
                                    value={productForm.subtitleAr}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            subtitleAr: event.target.value,
                                        }))
                                    }
                                    placeholder="قصة معمارية مريحة"
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Subtitle (English)" : "عنوان فرعي (بالإنجليزية)"}</span>
                                <input
                                    value={productForm.subtitleEn}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            subtitleEn: event.target.value,
                                        }))
                                    }
                                    placeholder="Relaxed architectural silhouette"
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Category" : "نوع المنتج"}</span>
                                <select
                                    value={productForm.productTypeId}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            productTypeId: event.target.value,
                                        }))
                                    }
                                    required
                                >
                                    {productTypes.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nameAr}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Price (DZD)" : "السعر"}</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={productForm.price}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            price: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{isEn ? "Gender Collection" : "الجنس"}</span>
                                <select
                                    value={productForm.gender}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            gender: event.target.value as "MALE" | "FEMALE" | "BOTH",
                                        }))
                                    }
                                    required
                                >
                                    <option value="MALE">{isEn ? "Men" : "رجالي"}</option>
                                    <option value="FEMALE">{isEn ? "Women" : "نسائي"}</option>
                                    <option value="BOTH">{isEn ? "Unisex / Both" : "للجميع"}</option>
                                </select>
                            </label>

                            <label className={styles.fieldCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={productForm.discountActive}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            discountActive: event.target.checked,
                                        }))
                                    }
                                />
                                <span>{isEn ? "Enable Discount" : "تفعيل خصم"}</span>
                            </label>

                            <label className={styles.fieldCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={productForm.isFeatured}
                                    onChange={(event) =>
                                        setProductForm((current) => ({
                                            ...current,
                                            isFeatured: event.target.checked,
                                        }))
                                    }
                                />
                                <span>{isEn ? "Featured Product" : "منتج مميز"}</span>
                            </label>

                            {productForm.discountActive ? (
                                <label className={styles.field}>
                                    <span>{isEn ? "Discounted Price (DZD)" : "السعر بعد الخصم"}</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={productForm.discountedPrice}
                                        onChange={(event) =>
                                            setProductForm((current) => ({
                                                ...current,
                                                discountedPrice: event.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </label>
                            ) : null}
                        </div>

                        <label className={`${styles.field} ${styles.fieldFull}`}>
                            <span>{isEn ? "Product Description (Arabic)" : "وصف المنتج (بالعربية)"}</span>
                            <textarea
                                rows={3}
                                value={productForm.descriptionAr}
                                onChange={(event) =>
                                    setProductForm((current) => ({
                                        ...current,
                                        descriptionAr: event.target.value,
                                    }))
                                }
                                required
                            />
                        </label>

                        <label className={`${styles.field} ${styles.fieldFull}`}>
                            <span>{isEn ? "Product Description (English)" : "Product Description (English)"}</span>
                            <textarea
                                rows={3}
                                value={productForm.descriptionEn}
                                onChange={(event) =>
                                    setProductForm((current) => ({
                                        ...current,
                                        descriptionEn: event.target.value,
                                    }))
                                }
                                required
                            />
                        </label>

                        <label className={`${styles.field} ${styles.fieldFull}`}>
                            <span>{isEn ? "Product Images (Direct Cloudinary Upload)" : "صور المنتج (رفع مباشر إلى Cloudinary)"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleProductImageSelection}
                                disabled={busy !== null || isUploadingImages}
                            />
                            <small className={styles.inlineInfo}>
                                {isEn
                                    ? "Select one or multiple images from your device. They will be uploaded and stored automatically."
                                    : "اختر صورة أو أكثر من جهازك. سيتم الرفع تلقائيًا ثم حفظ الرابط في قاعدة البيانات."}
                            </small>

                            {productForm.imageUrls.length > 0 ? (
                                <div className={styles.uploadedImageGrid}>
                                    {productForm.imageUrls.map((url, index) => (
                                        <article key={`${url}-${index}`} className={styles.uploadedImageCard}>
                                            <div className={styles.uploadedImagePreviewWrap}>
                                                <Image
                                                    src={url}
                                                    alt={`صورة المنتج ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 700px) 100vw, 25vw"
                                                    className={styles.uploadedImagePreview}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.ghostButton}
                                                onClick={() => removeProductImage(url)}
                                                disabled={busy !== null || isUploadingImages}
                                            >
                                                {isEn ? "Remove Image" : "إزالة الصورة"}
                                            </button>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.inlineInfo}>{isEn ? "No images uploaded yet." : "لم يتم رفع أي صورة بعد."}</p>
                            )}
                        </label>

                        <div className={`${styles.field} ${styles.fieldFull}`}>
                            <span>{isEn ? "Link Variations to Product" : "ربط قيم المتغيرات بالمنتج"}</span>
                            <div className={styles.variationGroupGrid}>
                                {variationsForSelectedType.map((variation) => (
                                    <div key={variation.id} className={styles.variationGroupCard}>
                                        <strong>{variation.nameAr}</strong>
                                        <div className={styles.checkboxGrid}>
                                            {variation.values.map((value) => (
                                                <label key={value.id} className={styles.checkboxChip}>
                                                    <input
                                                        type="checkbox"
                                                        checked={productForm.variationValueIds.includes(value.id)}
                                                        onChange={() => toggleVariationValue(value.id)}
                                                    />
                                                    <span>
                                                        {value.valueAr}
                                                        {value.hexColor ? <small className={styles.hexValue}>{value.hexColor}</small> : null}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {variationsForSelectedType.length === 0 ? (
                                    <p className={styles.inlineInfo}>{isEn ? "No variations configured for this category yet. Add them in the Variations tab." : "لا توجد متغيرات بعد لهذا النوع. أضفها من تبويب المتغيرات."}</p>
                                ) : null}
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button className={styles.primaryButton} type="submit" disabled={busy !== null || isUploadingImages}>
                                {isUploadingImages
                                    ? (isEn ? "Uploading images..." : "جارٍ رفع الصور...")
                                    : busy === "save-product"
                                        ? (isEn ? "Saving..." : "جارٍ الحفظ...")
                                        : editingProductId
                                            ? (isEn ? "Save Product" : "حفظ المنتج")
                                            : (isEn ? "Add Product" : "إضافة المنتج")}
                            </button>
                            {editingProductId ? (
                                <button className={styles.ghostButton} type="button" onClick={resetProductForm}>
                                    {isEn ? "Cancel" : "إلغاء"}
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <div className={`${styles.card} ${styles.spanTwo}`}>
                        <div className={styles.cardHeader}>
                            <h2>{isEn ? "Product Catalog" : "قائمة المنتجات"}</h2>
                            <p>{products.length} {isEn ? "products" : "منتج"}</p>
                        </div>

                        <div className={styles.list}>
                            {products.map((item) => (
                                <article key={item.id} className={styles.productItem}>
                                    <div>
                                        <strong>{item.nameAr} {item.nameEn ? <span style={{ opacity: 0.75, fontWeight: 500, fontSize: "0.9em" }}>({item.nameEn})</span> : null}</strong>
                                        <span>
                                            {isEn ? `Category: ${item.productTypeNameAr} | slug: ${item.slug}` : `النوع: ${item.productTypeNameAr} | slug: ${item.slug}`}
                                        </span>
                                        <small>
                                            {isEn ? `Price: ${formatPrice(item.price)} DZD | Discount: ${item.discountActive ? "Yes" : "No"}` : `السعر: ${formatPrice(item.price)} دج | خصم: ${item.discountActive ? "نعم" : "لا"}`}
                                        </small>
                                        {item.discountActive && item.discountedPrice !== null ? (
                                            <small>{isEn ? `Discounted Price: ${formatPrice(item.discountedPrice)} DZD` : `السعر بعد الخصم: ${formatPrice(item.discountedPrice)} دج`}</small>
                                        ) : null}
                                        <small>
                                            {isEn
                                                ? `Attributes: ${item.selectedVariations.map((value) => `${value.variationNameAr}: ${value.valueAr}`).join(" | ") || "None"}`
                                                : `القيم المرتبطة: ${item.selectedVariations.map((value) => `${value.variationNameAr}: ${value.valueAr}`).join(" | ") || "بدون"}`}
                                        </small>
                                    </div>

                                    <div className={styles.inlineActions}>
                                        <button type="button" className={styles.ghostButton} onClick={() => startEditProduct(item)}>
                                            {isEn ? "Edit" : "تعديل"}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() =>
                                                openDeleteDialog({
                                                    title: isEn ? "Confirm Product Deletion" : "تأكيد حذف المنتج",
                                                    description: isEn ? "This will delete the product and clear associated assets from Cloudinary." : "سيتم حذف المنتج من قاعدة البيانات وحذف صوره من Cloudinary لتفادي الصور غير المستخدمة.",
                                                    successText: isEn ? "Product deleted successfully" : "تم حذف المنتج",
                                                    busyKey: `delete-product-${item.id}`,
                                                    url: `/api/admin/products/${item.id}`,
                                                })
                                            }
                                            disabled={busy !== null}
                                        >
                                            {isEn ? "Delete" : "حذف"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {activeTab === "testimonials" ? (
                <div className={styles.sectionGrid}>
                    <form className={styles.card} onSubmit={handleTestimonialSubmit}>
                        <div className={styles.cardHeader}>
                            <h2>{editingTestimonialId ? (isEn ? "Edit Testimonial" : "تعديل رأي") : (isEn ? "Add Testimonial" : "إضافة رأي")}</h2>
                            <p>{isEn ? "Rating from 1 to 5" : "التقييم من 1 إلى 5"}</p>
                        </div>

                        <label className={styles.field}>
                            <span>{isEn ? "Client Name" : "الاسم"}</span>
                            <input
                                value={testimonialForm.nameAr}
                                onChange={(event) =>
                                    setTestimonialForm((current) => ({
                                        ...current,
                                        nameAr: event.target.value,
                                    }))
                                }
                                placeholder={isEn ? "e.g. Karim B." : "الاسم"}
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "Role / Title" : "الدور / الصفة"}</span>
                            <input
                                value={testimonialForm.roleAr}
                                onChange={(event) =>
                                    setTestimonialForm((current) => ({
                                        ...current,
                                        roleAr: event.target.value,
                                    }))
                                }
                                placeholder={isEn ? "e.g. Verified Client" : "زبون دائم"}
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "Rating (1 to 5)" : "التقييم"}</span>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={testimonialForm.rating}
                                onChange={(event) =>
                                    setTestimonialForm((current) => ({
                                        ...current,
                                        rating: event.target.value,
                                    }))
                                }
                                required
                            />
                        </label>

                        <label className={styles.field}>
                            <span>{isEn ? "Testimonial Text" : "النص"}</span>
                            <textarea
                                rows={4}
                                value={testimonialForm.textAr}
                                onChange={(event) =>
                                    setTestimonialForm((current) => ({
                                        ...current,
                                        textAr: event.target.value,
                                    }))
                                }
                                required
                            />
                        </label>

                        <div className={styles.formActions}>
                            <button className={styles.primaryButton} type="submit" disabled={busy !== null}>
                                {busy === "save-testimonial"
                                    ? (isEn ? "Saving..." : "جارٍ الحفظ...")
                                    : editingTestimonialId
                                        ? (isEn ? "Save Testimonial" : "حفظ الرأي")
                                        : (isEn ? "Add Testimonial" : "إضافة الرأي")}
                            </button>
                            {editingTestimonialId ? (
                                <button className={styles.ghostButton} type="button" onClick={resetTestimonialForm}>
                                    {isEn ? "Cancel" : "إلغاء"}
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>{isEn ? "Customer Testimonials" : "آراء العملاء"}</h2>
                            <p>{testimonials.length} {isEn ? "reviews" : "رأي"}</p>
                        </div>

                        <div className={styles.list}>
                            {testimonials.map((item) => (
                                <article key={item.id} className={styles.listItem}>
                                    <div>
                                        <strong>{item.nameAr}</strong>
                                        <span>{item.roleAr}</span>
                                        <small>{item.textAr}</small>
                                        <small>{isEn ? `Rating: ${item.rating}/5` : `التقييم: ${item.rating}/5`}</small>
                                    </div>

                                    <div className={styles.inlineActions}>
                                        <button type="button" className={styles.ghostButton} onClick={() => startEditTestimonial(item)}>
                                            {isEn ? "Edit" : "تعديل"}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={() =>
                                                openDeleteDialog({
                                                    title: isEn ? "Confirm Review Deletion" : "تأكيد حذف الرأي",
                                                    description: isEn ? "Are you sure you want to remove this customer testimonial?" : "هل أنت متأكد من حذف هذا الرأي؟",
                                                    successText: isEn ? "Testimonial removed successfully" : "تم حذف الرأي",
                                                    busyKey: `delete-testimonial-${item.id}`,
                                                    url: `/api/admin/testimonials/${item.id}`,
                                                })
                                            }
                                            disabled={busy !== null}
                                        >
                                            {isEn ? "Delete" : "حذف"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {deleteDialog ? (
                <div
                    className={styles.modalBackdrop}
                    role="presentation"
                    onClick={() => {
                        if (!isDeleteBusy) {
                            setDeleteDialog(null);
                        }
                    }}
                >
                    <div className={styles.modalCard} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                        <h3>{deleteDialog.title}</h3>
                        <p>{deleteDialog.description}</p>

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.ghostButton}
                                onClick={() => setDeleteDialog(null)}
                                disabled={isDeleteBusy}
                            >
                                {isEn ? "Cancel" : "إلغاء"}
                            </button>
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={() => void confirmDeleteDialog()}
                                disabled={isDeleteBusy}
                            >
                                {isDeleteBusy ? (isEn ? "Deleting..." : "جارٍ الحذف...") : (isEn ? "Confirm Delete" : "تأكيد الحذف")}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
