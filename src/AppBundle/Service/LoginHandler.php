<?php
namespace AppBundle\Service;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Routing\RouterInterface;


class LoginHandler implements AuthenticationSuccessHandlerInterface {

    public function __construct(RouterInterface $router, $container)
    {

    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
        return new JsonResponse([
            'success' => true,
            'user'    => $token->getUsername()
        ]);
    }
}