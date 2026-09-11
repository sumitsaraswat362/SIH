import { NextResponse } from 'next/server';
import { Firestore } from '@google-cloud/firestore';
import { Order } from '@/lib/types';

const firestore = new Firestore({
  projectId: 'project-a9c284f8-6bca-440a-a0c',
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const farmerId = searchParams.get('farmerId');
    const buyerId = searchParams.get('buyerId');

    if (!farmerId && !buyerId) {
      return NextResponse.json({ error: 'Must provide farmerId or buyerId' }, { status: 400 });
    }

    let query: FirebaseFirestore.Query = firestore.collection('orders');
    
    if (farmerId) {
      query = query.where('farmerId', '==', farmerId);
    }
    if (buyerId) {
      query = query.where('buyerId', '==', buyerId);
    }

    const snapshot = await query.get();
    
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    // Sort by createdAt descending (client-side since we didn't index)
    orders.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.listingId || !body.farmerId || !body.buyerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Compute totalAmount if not provided directly
    const totalAmount = body.totalAmount || (body.quantityKg && body.agreedPricePerKg 
      ? body.quantityKg * body.agreedPricePerKg 
      : 0);

    if (!totalAmount) {
      return NextResponse.json({ error: 'Cannot compute totalAmount. Provide totalAmount or quantityKg + agreedPricePerKg.' }, { status: 400 });
    }

    const platformFee = 0; // Zero platform fee — free for farmers and buyers
    const farmerPayout = totalAmount;
    const middlemanSavings = totalAmount * 0.40; // Estimated 40% savings vs traditional supply chain

    const newOrder = {
      ...body,
      totalAmount,
      platformFee,
      farmerPayout,
      middlemanSavings,
      createdAt: Date.now(),
      status: 'pending',
      paymentStatus: 'pending',
    };

    const docRef = await firestore.collection('orders').add(newOrder);
    const createdOrder = { id: docRef.id, ...newOrder };

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await firestore.collection('orders').doc(orderId).update(updateData);

    return NextResponse.json({ success: true, updated: updateData });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
