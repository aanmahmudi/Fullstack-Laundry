package com.laundry.BE_Laundry.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.laundry.BE_Laundry.Model.Shop;
import com.laundry.BE_Laundry.Service.ShopService;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @GetMapping("/mine/details")
    public ResponseEntity<Shop> getMyShop() {
        Shop shop = shopService.getMyShop();
        if (shop != null) {
            return ResponseEntity.ok(shop);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Shop> createShop(@RequestBody Shop shop) {
        return ResponseEntity.ok(shopService.createShop(shop));
    }

    @GetMapping
    public ResponseEntity<List<Shop>> getShopsByOwner(@RequestParam(required = false) Long ownerId) {
        if (ownerId != null) {
            return ResponseEntity.ok(shopService.getShopsByOwner(ownerId));
        }
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable Long id) {
        Shop shop = shopService.getShopById(id);
        if (shop != null) {
            return ResponseEntity.ok(shop);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shop> updateShop(@PathVariable Long id, @RequestBody Shop shopDetails) {
        Shop updatedShop = shopService.updateShop(id, shopDetails);
        if (updatedShop != null) {
            return ResponseEntity.ok(updatedShop);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        shopService.deleteShop(id);
        return ResponseEntity.noContent().build();
    }
}
