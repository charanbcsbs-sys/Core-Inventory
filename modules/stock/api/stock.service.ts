import { prisma } from "@/prisma/client";
import { type Stock } from "@prisma/client";

/**
 * Service to handle all stock operations.
 */
export class StockService {
  /**
   * Get all stock records across all warehouses.
   */
  static async getAllStocks(): Promise<Stock[]> {
    return await prisma.stock.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true, location: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Get stock records for a specific product across all warehouses.
   */
  static async getStockByProduct(productId: string): Promise<Stock[]> {
    return await prisma.stock.findMany({
      where: { productId },
      include: {
        warehouse: { select: { name: true, location: true } },
      },
    });
  }

  /**
   * Get all stock records in a specific warehouse.
   */
  static async getStockByWarehouse(warehouseId: string): Promise<Stock[]> {
    return await prisma.stock.findMany({
      where: { warehouseId },
      include: {
        product: { select: { name: true, sku: true } },
      },
    });
  }

  /**
   * Create a new stock record. Validates that it doesn't already exist.
   */
  static async createStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    userId: string;
  }): Promise<Stock> {
    const existing = await prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    if (existing) {
      throw new Error("Stock record already exists for this product in this warehouse.");
    }

    if (data.quantity < 0) {
      throw new Error("Initial stock quantity cannot be negative.");
    }

    return await prisma.stock.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        userId: data.userId,
      },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
    });
  }

  /**
   * Update an existing stock record by ID.
   */
  static async updateStock(
    id: string,
    data: { quantity?: number; reservedQuantity?: number },
  ): Promise<Stock> {
    const stock = await prisma.stock.findUnique({ where: { id } });
    
    if (!stock) {
      throw new Error("Stock record not found.");
    }

    // Business Logic: Real quantity cannot go below 0.
    const updatedQuantity = data.quantity ?? stock.quantity;
    if (updatedQuantity < 0) {
      throw new Error("Stock quantity cannot be less than zero.");
    }

    return await prisma.stock.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}
