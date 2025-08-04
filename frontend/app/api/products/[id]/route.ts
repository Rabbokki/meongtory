import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    console.log('상품 조회 시작, ID:', productId);

    const response = await fetch(`http://localhost:8081/api/products/${productId}`, {
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
        { error: `상품을 찾을 수 없습니다. (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const product = await response.json();
    console.log('가져온 상품 데이터:', product);

    // 백엔드 데이터 구조를 프론트엔드 형식으로 변환
    const transformedProduct = {
      id: product.productId,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "/placeholder.svg",
      category: product.category,
      description: product.description || "",
      tags: product.tags ? JSON.parse(product.tags) : [],
      stock: product.stock,
      petType: product.targetAnimal === 'ALL' ? 'all' : product.targetAnimal === 'DOG' ? 'dog' : 'cat',
      targetAnimal: product.targetAnimal,
      registrationDate: product.registrationDate,
      registeredBy: product.registeredBy
    };

    console.log('백엔드 원본 데이터:', product);
    console.log('변환된 상품 데이터:', transformedProduct);

    console.log('변환된 상품 데이터:', transformedProduct);
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    console.log('상품 삭제 시작, ID:', productId);

    const response = await fetch(`http://localhost:8081/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('백엔드 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('백엔드 오류 응답:', errorText);
      return NextResponse.json(
        { error: `상품 삭제에 실패했습니다. (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    console.log('상품 삭제 성공');
    return NextResponse.json({ message: '상품이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await request.json();
    console.log('상품 수정 시작, ID:', productId, '데이터:', body);

    const response = await fetch(`http://localhost:8081/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('백엔드 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('백엔드 오류 응답:', errorText);
      return NextResponse.json(
        { error: `상품 수정에 실패했습니다. (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const updatedProduct = await response.json();
    console.log('수정된 상품 데이터:', updatedProduct);

    // 백엔드 데이터 구조를 프론트엔드 형식으로 변환
    const transformedProduct = {
      id: updatedProduct.productId,
      name: updatedProduct.name,
      price: updatedProduct.price,
      image: updatedProduct.imageUrl || "/placeholder.svg",
      category: updatedProduct.category,
      description: updatedProduct.description || "",
      tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
      stock: updatedProduct.stock,
      petType: updatedProduct.targetAnimal === 'ALL' ? 'all' : updatedProduct.targetAnimal === 'DOG' ? 'dog' : 'cat',
      registrationDate: updatedProduct.registrationDate,
      registeredBy: updatedProduct.registeredBy
    };

    console.log('변환된 상품 데이터:', transformedProduct);
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 