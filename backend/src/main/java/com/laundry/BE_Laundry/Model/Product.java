package com.laundry.BE_Laundry.Model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	@Column(precision = 15, scale = 2)
	private BigDecimal price;
	
	@Column(name = "photo_url")
	private String photoUrl;
	
	private String description;

	private String category;

	@Column(name = "sizes")
	private String sizes;

	@Column(name = "colors")
	private String colors;

	@Column(name = "stock_by_color")
	private String stockByColor;

	@Column(name = "variant_1_name")
	private String variant1Name;

	@Column(name = "variant_2_name")
	private String variant2Name;

	@Column(name = "stock_total")
	private Integer stockTotal;

	@Column(name = "brand")
	private String brand;

	@Column(name = "material")
	private String material;

	@Column(name = "shelf_life")
	private String shelfLife;

	@Column(name = "weight_grams")
	private Integer weightGrams;

	@Column(name = "package_length_cm")
	private Integer packageLengthCm;

	@Column(name = "package_width_cm")
	private Integer packageWidthCm;

	@Column(name = "package_height_cm")
	private Integer packageHeightCm;

	@Column(name = "shipping_methods")
	private String shippingMethods;

	@Column(name = "preorder")
	private Boolean preOrder;

	@Column(name = "preorder_days")
	private Integer preOrderDays;

	@Column(name = "video_url")
	private String videoUrl;

	@Column(name = "extra_image_urls")
	private String extraImageUrls;

	@Column(name = "owner_id")
	private Long ownerId;

	@Column(name = "shop_id")
	private Long shopId;
}
