import { RowDataPacket } from "mysql2/promise";
import { query, queryOne } from "../db/pool";
import { DashboardStats } from "../types";

interface OrdersAggRow extends RowDataPacket {
  totalRevenue: number | string;
  totalOrders: number;
  pendingOrders: number | string;
}

interface CountRow extends RowDataPacket {
  count: number;
}

interface PopularDishRow extends RowDataPacket {
  name: string;
  count: number | string;
  revenue: number | string;
}

export const statsRepository = {
  async getStats(): Promise<DashboardStats> {
    const ordersAgg = await queryOne<OrdersAggRow>(`
      SELECT 
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) AS totalRevenue,
        COUNT(*) AS totalOrders,
        COALESCE(SUM(CASE WHEN status IN ('preparing', 'cooking_in_wok', 'out_for_delivery') THEN 1 ELSE 0 END), 0) AS pendingOrders
      FROM orders
    `);

    const resAgg = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM reservations"
    );

    const dishesAgg = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM dishes WHERE is_available = 1"
    );

    const popularRows = await query<PopularDishRow>(`
      SELECT 
        oi.name,
        SUM(oi.qty) AS count,
        SUM(oi.price * oi.qty) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      GROUP BY oi.name
      ORDER BY count DESC
      LIMIT 5
    `);

    return {
      totalRevenue: ordersAgg ? Number(ordersAgg.totalRevenue) : 0,
      totalOrders: ordersAgg ? Number(ordersAgg.totalOrders) : 0,
      pendingOrders: ordersAgg ? Number(ordersAgg.pendingOrders) : 0,
      totalReservations: resAgg ? Number(resAgg.count) : 0,
      activeDishesCount: dishesAgg ? Number(dishesAgg.count) : 0,
      popularDishes: popularRows.map((r) => ({
        name: r.name,
        count: Number(r.count),
        revenue: Number(r.revenue),
      })),
    };
  },
};
