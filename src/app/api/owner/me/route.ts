return NextResponse.json({
  id: owner.id,
  name: owner.name,
  email: owner.email,
  isPremium: owner.isPremium,
  premiumUntil: owner.premiumUntil,
});
