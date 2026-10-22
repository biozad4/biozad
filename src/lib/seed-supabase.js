const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const connectionString = 'postgresql://postgres.pbxootcdttwvwokhnhqy:CZ2K%25%40MnT%2B*2%23gy@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase for seeding...');
    await client.connect();

    // 1. حساب الآدمن (Admin User)
    const adminEmail = 'admin@biozad.com';
    const checkAdmin = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (checkAdmin.rows.length === 0) {
      const passwordHash = await bcrypt.hash('BiozadAdmin2026', 10);
      await client.query(`
        INSERT INTO users (name, email, password_hash, role, loyalty_points)
        VALUES ($1, $2, $3, $4, $5)
      `, ['المدير العام BioZad', adminEmail, passwordHash, 'admin', 1000]);
      console.log('✓ Created default admin: admin@biozad.com / BiozadAdmin2026');
    } else {
      console.log('Admin already exists.');
    }

    // 2. إعدادات المتجر (Store Settings)
    const checkSettings = await client.query('SELECT id FROM store_settings LIMIT 1');
    if (checkSettings.rows.length === 0) {
      await client.query(`
        INSERT INTO store_settings (shipping_cost, free_shipping_min, is_free_shipping_globally)
        VALUES (40, 400, false)
      `);
      console.log('✓ Created store settings (Shipping: 40 MAD, Free over 400 MAD)');
    }

    // 3. الأقسام (Categories)
    const categoriesData = [
      { slug: 'natural-honey', ar: 'عسل طبيعي حر', fr: 'Miel Naturel Pur', image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800' },
      { slug: 'amlou', ar: 'أملو بلدي أصيل', fr: 'Amlou Traditionnel', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800' },
      { slug: 'argan-oils', ar: 'زيوت أركان نقية', fr: "Huiles d'Argan Pures", image: 'https://images.unsplash.com/photo-1608248597359-bb5c68f2f254?auto=format&fit=crop&q=80&w=800' },
      { slug: 'tea', ar: 'شاي وأعشاب منسمة', fr: 'Thé et Infusions', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800' },
      { slug: 'offers', ar: 'عروض وباقات توفيرية', fr: 'Packs et Offres', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800' },
      { slug: 'remedies', ar: 'وصفات وخلطات علاجية', fr: 'Remèdes Naturels', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=800' },
      { slug: 'perfumes', ar: 'عطور ومستخلصات طبيعية', fr: 'Parfums et Extraits', image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800' },
    ];

    const categoryMap = {};

    for (const cat of categoriesData) {
      let res = await client.query('SELECT id FROM categories WHERE slug = $1', [cat.slug]);
      if (res.rows.length === 0) {
        res = await client.query(`
          INSERT INTO categories (name_ar, name_fr, slug, image, is_active)
          VALUES ($1, $2, $3, $4, true)
          RETURNING id
        `, [cat.ar, cat.fr, cat.slug, cat.image]);
        console.log(`✓ Created category: ${cat.ar}`);
      }
      categoryMap[cat.slug] = res.rows[0].id;
    }

    // 4. عينة منتجات بيوزاد الطبيعية (Sample Products)
    const productsData = [
      {
        titleAr: 'زيت أركان التجميلي البكر الممتاز',
        titleFr: "Huile d'Argan Cosmétique Extra Vierge",
        slug: 'argan-cosmetic-oil-extra-pure',
        descriptionAr: 'زيت أركان نقي 100% معصور على البارد من أجود حبات الأركان المغربية بسوس، غني بفيتامين E ومضادات الأكسدة لترطيب البشرة ومكافحة التجاعيد وتقوية الشعر.',
        descriptionFr: "Huile d'argan 100% pure et pressée à froid, riche en vitamine E pour hydrater la peau et renforcer les cheveux.",
        categorySlug: 'argan-oils',
        sku: 'BZ-ARG-001',
        barcode: '6111234560011',
        price: 180,
        compareAtPrice: 220,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1608248597359-bb5c68f2f254?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
      },
      {
        titleAr: 'عسل السدر الحر الطبيعي',
        titleFr: 'Miel de Jujubier Sidr Naturel',
        slug: 'sidr-honey-natural-pure',
        descriptionAr: 'عسل سدر بلدي حر أصلي ومفحوص مخبرياً، ذو طعم غني وقيمة علاجية وغذائية فائقة لتقوية المناعة.',
        descriptionFr: 'Miel de Sidr naturel et pur du Maroc, reconnu pour ses bienfaits nutritionnels et son goût exceptionnel.',
        categorySlug: 'natural-honey',
        sku: 'BZ-HON-002',
        barcode: '6111234560028',
        price: 290,
        compareAtPrice: 350,
        stock: 35,
        images: ['https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
      },
      {
        titleAr: 'أملو باللوز البلدي وزيت الأركان وعسل الدغموس',
        titleFr: "Amlou Royal aux Amandes et Huile d'Argan",
        slug: 'amlou-royal-almonds-argan',
        descriptionAr: 'أملو سوسي تقليدي محضر باللوز البلدي المحمص، وزيت الأركان الصافي، ومحلى بعسل الدغموس الطبيعي بدون أي مواد حافظة أو سكر مضاف.',
        descriptionFr: "Délicieux Amlou marocain traditionnel aux amandes grillées, huile d'argan pure et miel naturel.",
        categorySlug: 'amlou',
        sku: 'BZ-AML-003',
        barcode: '6111234560035',
        price: 140,
        compareAtPrice: 170,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
      },
      {
        titleAr: 'شاي الأعشاب المهدئ والمنسم بالأعشاب الأطلسية',
        titleFr: 'Infusion Royale Apaisante aux Plantes de l’Atlas',
        slug: 'atlas-calming-herbal-tea',
        descriptionAr: 'توليفة فاخرة من الأعشاب العطرية الجبلية (لويزة، فليو، زعتر بري، مرددوش) تساعد على الاسترخاء وتحسين الهضم.',
        descriptionFr: 'Mélange raffiné de plantes médicinales marocaines pour la détente et le confort digestif.',
        categorySlug: 'tea',
        sku: 'BZ-TEA-004',
        barcode: '6111234560042',
        price: 65,
        compareAtPrice: 85,
        stock: 60,
        images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800'],
        isFeatured: false,
      }
    ];

    for (const prod of productsData) {
      const checkProd = await client.query('SELECT id FROM products WHERE slug = $1', [prod.slug]);
      if (checkProd.rows.length === 0) {
        const catId = categoryMap[prod.categorySlug];
        await client.query(`
          INSERT INTO products (
            title_ar, title_fr, slug, description_ar, description_fr,
            category_id, sku, barcode, price, compare_at_price,
            stock, images, is_featured, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
        `, [
          prod.titleAr, prod.titleFr, prod.slug, prod.descriptionAr, prod.descriptionFr,
          catId, prod.sku, prod.barcode, prod.price, prod.compareAtPrice,
          prod.stock, prod.images, prod.isFeatured
        ]);
        console.log(`✓ Created product: ${prod.titleAr}`);
      }
    }

    // 5. كوبون ترحيبي (Welcome Coupon)
    const checkCoupon = await client.query('SELECT id FROM coupons WHERE code = $1', ['BIOZAD10']);
    if (checkCoupon.rows.length === 0) {
      await client.query(`
        INSERT INTO coupons (code, discount_type, discount_value, applies_to_type, is_active)
        VALUES ('BIOZAD10', 'percentage', 10, 'all', true)
      `);
      console.log('✓ Created coupon: BIOZAD10 (10% OFF)');
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.end();
  }
}

seed();
