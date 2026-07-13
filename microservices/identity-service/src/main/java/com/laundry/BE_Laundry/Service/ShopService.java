package com.laundry.BE_Laundry.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.laundry.BE_Laundry.Model.Shop;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Repository.ShopRepository;
import com.laundry.BE_Laundry.Repository.CustomerRepository;
import com.laundry.BE_Laundry.Utill.SecurityUtil;

@Service
public class ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public Shop createShop(Shop shop) {
        String email = SecurityUtil.getCurrentUserEmail();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        shop.setOwnerId(customer.getId());
        return shopRepository.save(shop);
    }

    public List<Shop> getShopsByOwner(Long ownerId) {
        return shopRepository.findByOwnerId(ownerId);
    }

    public Shop getMyShop() {
        String email = SecurityUtil.getCurrentUserEmail();
        if (email == null) {
            throw new RuntimeException("Authentication required");
        }
        
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Shop> shops = shopRepository.findByOwnerId(customer.getId());
        if (shops.isEmpty()) {
            // Jika belum punya toko, buatkan satu secara otomatis (fallback)
            Shop newShop = new Shop();
            newShop.setName(customer.getUsername() + " Shop");
            newShop.setDescription("Welcome to my shop!");
            newShop.setOwnerId(customer.getId());
            return shopRepository.save(newShop);
        }
        return shops.get(0);
    }

    public Shop getShopById(Long id) {
        Optional<Shop> shop = shopRepository.findById(id);
        return shop.orElse(null);
    }

    public Shop updateShop(Long id, Shop shopDetails) {
        Shop shop = shopRepository.findById(id).orElseThrow(() -> new RuntimeException("Shop not found"));
        
        String email = SecurityUtil.getCurrentUserEmail();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!shop.getOwnerId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized access to shop");
        }

        shop.setName(shopDetails.getName());
        shop.setDescription(shopDetails.getDescription());
        shop.setImageUrl(shopDetails.getImageUrl());
        return shopRepository.save(shop);
    }

    public void deleteShop(Long id) {
        Shop shop = shopRepository.findById(id).orElseThrow(() -> new RuntimeException("Shop not found"));
        
        String email = SecurityUtil.getCurrentUserEmail();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!shop.getOwnerId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized access to shop");
        }

        shopRepository.deleteById(id);
    }
}
