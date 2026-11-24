import crypto from "crypto";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { query, queryOne, execute, withTransaction } from "../db/pool";
import { Order, OrderItem, OrderStatus } from "../types";

interface OrderRow extends RowDataPacket {
  id: number;
  code: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  spice_level: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: "pending" | "paid";
  transaction_id: string | null;
  estimated_delivery_mins: number;
  notes: string | null;
  created_at: Date;
}

interface OrderItemRow extends RowDataPacket {
  id: number;
  order_id: number;
  dish_id: number | null;
  name: string;
  price: number;
  qty: number;
  image_url: string;
}

function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.dish_id ?? undefined,
    name: row.name,
    price: row.price,
    qty: row.qty,
    image: row.image_url,
  };
}

function mapOrder(orderRow: OrderRow, items: OrderItem[]): Order {
  return {
    id: orderRow.code,
    customerName: orderRow.customer_name,
    customerPhone: orderRow.customer_phone,
    address: orderRow.address,
    items,
    subtotal: orderRow.subtotal,
    deliveryFee: orderRow.delivery_fee,
    discount: orderRow.discount,
    total: orderRow.total,
    spiceLevel: orderRow.spice_level,
    status: orderRow.status,
    paymentMethod: orderRow.payment_method,
    paymentStatus: orderRow.payment_status,
    transactionId: orderRow.transaction_id ?? undefined,
    estimatedDeliveryMins: orderRow.estimated_delivery_mins,
    notes: orderRow.notes ?? undefined,
    createdAt: orderRow.created_at.toISOString(),
  };
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  spiceLevel: string;
  paymentMethod: string;
  paymentStatus?: "pending" | "paid";
  transactionId?: string;
  estimatedDeliveryMins?: number;
  notes?: string;
}

export const orderRepository = {
  async getAll(): Promise<Order[]> {
    const orders = await query<OrderRow>(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    if (orders.length === 0) return [];

    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => "?").join(",");
    const items = await query<OrderItemRow>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`,
      orderIds
    );

    const itemsByOrderId = new Map<number, OrderItem[]>();
    for (const item of items) {
      const list = itemsByOrderId.get(item.order_id) || [];
      list.push(mapOrderItem(item));
      itemsByOrderId.set(item.order_id, list);
    }

    return orders.map((o) => mapOrder(o, itemsByOrderId.get(o.id) || []));
  },

  async getById(idOrCode: string): Promise<Order | null> {
    const isCode = idOrCode.toUpperCase().startsWith("PK-");
    const sql = isCode
      ? "SELECT * FROM orders WHERE code = ?"
      : "SELECT * FROM orders WHERE code = ? OR id = ?";
    const params = isCode ? [idOrCode] : [idOrCode, idOrCode];

    const order = await queryOne<OrderRow>(sql, params);
    if (!order) return null;

    const items = await query<OrderItemRow>(
      "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
      [order.id]
    );

    return mapOrder(order, items.map(mapOrderItem));
  },

  async create(data: CreateOrderInput): Promise<Order> {
    return withTransaction(async (conn) => {
      // 1. Insert order with unique temporary code to prevent concurrent unique key collisions
      const tempCode = `tmp-${crypto.randomUUID()}`;
      const [insertResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO orders (
          code, customer_name, customer_phone, address, subtotal,
          delivery_fee, discount, total, spice_level, status,
          payment_method, payment_status, transaction_id,
          estimated_delivery_mins, notes
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_verification', ?, ?, ?, ?, ?
        )`,
        [
          tempCode,
          data.customerName,
          data.customerPhone,
          data.address,
          data.subtotal,
          data.deliveryFee,
          data.discount,
          data.total,
          data.spiceLevel,
          data.paymentMethod,
          data.paymentStatus || "pending",
          data.transactionId || null,
          data.estimatedDeliveryMins || 35,
          data.notes || null,
        ]
      );

      const orderId = insertResult.insertId;
      const code = `PK-${1000 + orderId}`;

      // 2. Set permanent unique code
      await conn.execute("UPDATE orders SET code = ? WHERE id = ?", [
        code,
        orderId,
      ]);

      // 3. Insert order items
      for (const item of data.items) {
        await conn.execute(
          `INSERT INTO order_items (order_id, dish_id, name, price, qty, image_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.id || null,
            item.name,
            item.price,
            item.qty,
            item.image || "",
          ]
        );
      }

      // 4. Retrieve created order
      const [orderRows] = await conn.query<OrderRow[]>(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );
      const [itemRows] = await conn.query<OrderItemRow[]>(
        "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
        [orderId]
      );

      return mapOrder(orderRows[0], itemRows.map(mapOrderItem));
    });
  },

  async updateStatus(
    idOrCode: string,
    status: OrderStatus
  ): Promise<Order | null> {
    const existing = await this.getById(idOrCode);
    if (!existing) return null;

    await execute("UPDATE orders SET status = ? WHERE code = ?", [
      status,
      existing.id,
    ]);

    return this.getById(existing.id);
  },
};
