import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('받은 데이터:', body);

    // 백엔드 API 호출
    const response = await fetch('http://localhost:8081/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        imageUrl: body.imageUrl,
        category: body.category,
        targetAnimal: body.petType === 'all' ? 'ALL' : body.petType === 'dog' ? 'DOG' : 'CAT',
        tags: JSON.stringify(body.tags),
        registrationDate: new Date().toISOString().split('T')[0],
        registeredBy: 'admin' // 임시로 admin으로 설정
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('백엔드 응답 오류:', errorText);
      console.error('백엔드 응답 상태:', response.status);
      return NextResponse.json(
        { error: `상품 등록에 실패했습니다. (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('상품 등록 성공:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('상품 목록 API 호출 시작...');
    const response = await fetch('http://localhost:8081/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('백엔드 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('백엔드 오류 응답:', errorText);
      return NextResponse.json(
        { error: `상품 목록을 가져오는데 실패했습니다. (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const products = await response.json();
    console.log('가져온 상품 데이터:', products);
    
    // 백엔드 데이터 구조를 프론트엔드 형식으로 변환
    const transformedProducts = products.map((product: any) => ({
      id: product.productId,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/placeholder.svg",
      category: product.category,
      description: product.description || "",
      tags: product.tags ? JSON.parse(product.tags) : [],
      stock: product.stock,
      petType: product.targetAnimal === 'ALL' ? 'all' : product.targetAnimal === 'DOG' ? 'dog' : 'cat',
      registrationDate: product.registrationDate,
      registeredBy: product.registeredBy
    }));
    
    console.log('변환된 상품 데이터:', transformedProducts);
    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 